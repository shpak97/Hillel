import { PUBLIC_MENU_BASE } from '@/features/restaurant/lib/slug';

type SystemField = {
  label: string;
  value: string;
};

type RestaurantCreatePreviewProps = {
  title: string;
  slug: string;
  description: string;
  address?: string;
  photosCount: number;
  isActive?: boolean;
  systemFields?: SystemField[];
};

export function RestaurantCreatePreview({
  title,
  slug,
  description,
  address = '',
  photosCount,
  isActive = true,
  systemFields,
}: RestaurantCreatePreviewProps) {
  const previewTitle = title.trim() || 'Назва ресторану';
  const previewSlug = slug.trim() || 'your-slug';
  const previewDescription =
    description.trim() || 'Опис зʼявиться тут після заповнення форми.';
  const previewAddress = address.trim();
  const status = !isActive
    ? 'disabled'
    : photosCount > 0
      ? 'active'
      : 'setup';

  const defaultSystemFields: SystemField[] = [
    { label: 'uuid', value: 'генерується автоматично' },
    { label: 'ownerId', value: 'поточний користувач' },
    { label: 'owner', value: 'relation через ownerId' },
  ];

  const fields = systemFields ?? defaultSystemFields;

  return (
    <aside className="space-y-4">
      <section className="rounded-[30px] bg-ink-950 p-5 text-white shadow-[0_28px_80px_-52px_rgba(23,21,18,0.9)]">
        <p className="text-[12px] font-black uppercase tracking-[0.14em] text-white/55">
          Preview
        </p>
        <h3 className="mt-3 text-3xl font-black">{previewTitle}</h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
          {previewDescription}
        </p>
        {previewAddress ? (
          <p className="mt-2 text-sm font-semibold leading-6 text-white/55">
            {previewAddress}
          </p>
        ) : null}

        <div className="mt-5 rounded-[24px] bg-white p-4 text-ink-950">
          <p className="text-[12px] font-bold text-ink-400">Public URL</p>
          <p className="mt-1 break-all text-sm font-black">
            {PUBLIC_MENU_BASE}/{previewSlug}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-white/10 p-4">
            <p className="text-[12px] font-bold text-white/55">Photos</p>
            <p className="mt-1 text-xl font-black">{photosCount}</p>
          </div>
          <div
            className={`rounded-[22px] p-4 ${
              status === 'disabled'
                ? 'bg-paper-100 text-ink-500'
                : 'bg-herb-50 text-herb'
            }`}
          >
            <p
              className={`text-[12px] font-bold ${
                status === 'disabled' ? 'text-ink-400' : 'text-herb/70'
              }`}
            >
              Status
            </p>
            <p className="mt-1 text-xl font-black">{status}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-card p-5 ring-1 ring-line">
        <h3 className="text-lg font-black text-ink-950">Системні поля</h3>
        <div className="mt-4 space-y-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-[22px] bg-paper-50 p-4 ring-1 ring-line"
            >
              <p className="text-[12px] font-black uppercase tracking-[0.12em] text-ink-400">
                {field.label}
              </p>
              <p className="mt-1 break-all text-sm font-bold text-ink-600">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
