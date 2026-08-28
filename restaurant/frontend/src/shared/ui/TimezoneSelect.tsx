'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  getTimezoneLabel,
  getTimezoneOptions,
  type TimezoneOption,
} from '@/shared/lib/timezone';

type TimezoneSelectProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
};

const MAX_RESULTS = 80;

function filterOptions(options: TimezoneOption[], query: string): TimezoneOption[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return options.slice(0, MAX_RESULTS);
  }

  return options
    .filter((option) => option.searchText.includes(normalized))
    .slice(0, MAX_RESULTS);
}

export function TimezoneSelect({
  value,
  onChange,
  label = 'Часовий пояс',
  error,
  hint,
}: TimezoneSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => getTimezoneOptions(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => filterOptions(options, query),
    [options, query],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectOption(option: TimezoneOption) {
    onChange(option.value);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <label
        htmlFor="timezone-select"
        className="mb-2 block text-sm font-black text-ink-800"
      >
        {label}
      </label>

      <button
        id="timezone-select"
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-14 w-full items-center justify-between rounded-field border bg-white px-4 text-left text-[16px] font-medium text-ink-950 transition',
          error
            ? 'border-danger ring-4 ring-danger/10'
            : 'border-line focus:border-brand focus:ring-4 focus:ring-brand/15',
        )}
      >
        <span className="min-w-0 truncate">{getTimezoneLabel(value)}</span>
        <span className="ml-3 shrink-0 text-sm font-black text-ink-400">▾</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_24px_70px_-35px_rgba(23,21,18,0.45)]">
          <div className="border-b border-line p-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук міста або timezone..."
              autoFocus
              className="h-11 w-full rounded-2xl border border-line bg-paper-50 px-3 text-sm font-medium text-ink-950 outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm font-semibold text-ink-500">
                Нічого не знайдено
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => selectOption(option)}
                    className={cn(
                      'flex w-full flex-col items-start px-4 py-3 text-left transition hover:bg-paper-50',
                      option.value === value && 'bg-brand-50',
                    )}
                  >
                    <span className="text-sm font-black text-ink-950">
                      {option.label}
                    </span>
                    <span className="mt-1 text-xs font-semibold text-ink-500">
                      {option.value}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 rounded-2xl bg-danger-50 px-3 py-2 text-[13px] font-bold leading-5 text-danger ring-1 ring-danger/10">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-[13px] font-semibold leading-5 text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
