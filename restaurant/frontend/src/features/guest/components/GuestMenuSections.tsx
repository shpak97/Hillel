import { AddToCartControl } from '@/features/guest/components/AddToCartControl';
import { getRestaurantPhotoUrl } from '@/features/restaurant/lib/photo-url';
import { formatMoney } from '@/shared/lib/format-money';
import type { SupportedCurrency } from '@/shared/model/currency';
import type { GuestMenuSection } from '@/features/guest/model/types';

type GuestMenuSectionsProps = {
  sections: GuestMenuSection[];
  currency: SupportedCurrency;
};

export function GuestMenuSections({ sections, currency }: GuestMenuSectionsProps) {
  if (sections.length === 0) {
    return (
      <p className="mt-8 rounded-field border border-dashed border-line bg-paper-50 px-4 py-3 text-sm font-bold text-ink-700">
        У цьому меню поки що немає розділів.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {sections.map((section) => (
        <section key={section.uuid} id={section.uuid} className="scroll-mt-20">
          <h2 className="border-b-2 border-brand/15 pb-2 text-xl font-black text-ink-950">
            {section.name}
          </h2>

          {section.items.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-ink-500">
              У цьому розділі поки що немає страв.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {section.items.map((item) => (
                <div
                  key={item.uuid}
                  className="rounded-[20px] border border-line bg-white p-3.5 transition hover:border-brand/30 hover:shadow-[0_10px_24px_-18px_rgba(23,21,18,0.35)] sm:p-4"
                >
                  <div className="flex items-start gap-3.5">
                    {item.photo ? (
                      <img
                        src={getRestaurantPhotoUrl(item.photo)}
                        alt={item.name}
                        className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-line"
                      />
                    ) : (
                      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-herb-50 text-base font-black text-ink-600 ring-1 ring-line">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="font-black text-ink-950">{item.name}</p>
                      {item.description ? (
                        <p className="mt-1 text-sm font-semibold text-ink-500">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="whitespace-nowrap rounded-pill bg-paper-100 px-2.5 py-1 text-sm font-extrabold text-ink-950">
                      {formatMoney(item.totalPrice, currency)}
                    </span>
                    <AddToCartControl
                      menuItemId={item.uuid}
                      name={item.name}
                      photo={item.photo}
                      unitPrice={item.totalPrice}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
