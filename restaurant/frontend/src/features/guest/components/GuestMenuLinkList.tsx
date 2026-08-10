import Link from 'next/link';

type GuestMenuLinkListItem = {
  menuId: string;
  menuName: string;
  selectTable?: boolean;
  url: string;
};

type GuestMenuLinkListProps = {
  menus: GuestMenuLinkListItem[];
  showSelectTableBadge?: boolean;
  emptyMessage: string;
};

export function GuestMenuLinkList({
  menus,
  showSelectTableBadge = false,
  emptyMessage,
}: GuestMenuLinkListProps) {
  if (menus.length === 0) {
    return (
      <p className="mt-8 rounded-field border border-dashed border-line bg-paper-50 px-4 py-3 text-sm font-bold text-ink-700">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {menus.map((menu) => (
        <li key={menu.menuId}>
          <Link
            href={menu.url}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-paper-50 px-4 py-4 transition hover:border-brand/40 hover:bg-brand/5"
          >
            <span className="text-base font-extrabold text-ink-950">
              {menu.menuName}
            </span>
            {showSelectTableBadge ? (
              <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-400">
                {menu.selectTable ? 'з вибором столика' : 'без столика'}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
