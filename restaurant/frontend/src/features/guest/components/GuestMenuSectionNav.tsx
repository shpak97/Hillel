'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { cn } from '@/shared/lib/cn';

type GuestMenuSectionNavProps = {
  sections: { uuid: string; name: string }[];
};

export function GuestMenuSectionNav({ sections }: GuestMenuSectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.uuid ?? '');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const section of sections) {
      const element = document.getElementById(section.uuid);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const container = listRef.current;
    const activeButton = container?.querySelector<HTMLElement>(
      `[data-id="${activeId}"]`,
    );
    if (!container || !activeButton) {
      return;
    }

    // Scroll only the pill strip horizontally — never scrollIntoView() here,
    // it fights the page's vertical scroll because this container is sticky.
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    if (buttonRect.left < containerRect.left) {
      container.scrollBy({
        left: buttonRect.left - containerRect.left - 16,
        behavior: 'smooth',
      });
    } else if (buttonRect.right > containerRect.right) {
      container.scrollBy({
        left: buttonRect.right - containerRect.right + 16,
        behavior: 'smooth',
      });
    }
  }, [activeId]);

  if (sections.length < 2) {
    return null;
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>, uuid: string) {
    event.preventDefault();
    // Next.js's router swallows the browser's native hash-fragment scroll
    // (confirmed: even a plain `location.hash = id` assignment no longer
    // scrolls), so the jump is done by hand instead of relying on it.
    document.getElementById(uuid)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${uuid}`);
  }

  return (
    <div
      ref={listRef}
      className="sticky top-0 z-30 -mx-6 flex gap-2 overflow-x-auto border-b border-line bg-white/95 px-6 py-3 backdrop-blur sm:-mx-8 sm:px-8"
    >
      {sections.map((section) => (
        <a
          key={section.uuid}
          href={`#${section.uuid}`}
          data-id={section.uuid}
          onClick={(event) => handleClick(event, section.uuid)}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-extrabold transition',
            activeId === section.uuid
              ? 'bg-ink-950 text-white'
              : 'bg-paper-100 text-ink-600 hover:bg-paper-200',
          )}
        >
          {section.name}
        </a>
      ))}
    </div>
  );
}
