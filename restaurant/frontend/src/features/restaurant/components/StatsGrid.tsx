import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: number | string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-[24px] bg-card p-4 ring-1 ring-line">
      <p className="text-[12px] font-black uppercase tracking-[0.12em] text-ink-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-ink-950">{value}</p>
    </div>
  );
}

type StatsGridProps = {
  children: React.ReactNode;
};

export function StatsGrid({ children }: StatsGridProps) {
  return <div className="mb-6 grid gap-3 sm:grid-cols-3">{children}</div>;
}
