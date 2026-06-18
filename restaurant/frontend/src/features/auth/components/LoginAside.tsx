export function LoginAside() {
  return (
    <div className="w-full max-w-[540px]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-herb">
            QR journey
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-ink-950">
            Гість сканує, замовляє, платить коли зручно.
          </h2>
        </div>
        <span className="rounded-pill bg-herb-50 px-4 py-2 text-sm font-black text-herb ring-1 ring-herb/10">
          Live
        </span>
      </div>

      <div className="rounded-[34px] bg-ink-950 p-4 shadow-[0_34px_90px_-45px_rgba(23,21,18,0.9)]">
        <div className="rounded-[26px] bg-paper-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-ink-400">Table 12</p>
              <p className="text-xl font-black text-ink-950">Замовлення #482</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-line">
              <p className="text-[12px] font-bold text-ink-400">До сплати</p>
              <p className="text-xl font-black text-ink-950">842 грн</p>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { emoji: '🍝', title: 'Паста з томатами', meta: '1 порція · кухня', price: '268', bg: 'bg-brand-50' },
              { emoji: '🥗', title: 'Салат з авокадо', meta: '1 порція · готово', price: '214', bg: 'bg-herb-50' },
              { emoji: '☕', title: 'Капучино', meta: '2 шт · бар', price: '160', bg: 'bg-[#fff5dc]' },
            ].map((item) => (
              <article
                key={item.title}
                className="flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-line"
              >
                <div className={`grid size-14 place-items-center rounded-2xl ${item.bg} text-2xl`}>
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-black text-ink-950">
                    {item.title}
                  </h3>
                  <p className="text-[13px] font-semibold text-ink-500">
                    {item.meta}
                  </p>
                </div>
                <p className="text-[15px] font-black text-ink-950">
                  {item.price}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-line">
              <p className="text-[12px] font-bold text-ink-400">QR</p>
              <p className="mt-1 text-lg font-black text-ink-950">скан</p>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-line">
              <p className="text-[12px] font-bold text-ink-400">Кошик</p>
              <p className="mt-1 text-lg font-black text-ink-950">3 позиції</p>
            </div>
            <div className="rounded-3xl bg-brand p-4 text-white">
              <p className="text-[12px] font-bold text-white/75">Оплата</p>
              <p className="mt-1 text-lg font-black">пізніше</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-sm font-bold text-ink-600">
        <div className="rounded-3xl bg-card/75 p-4 ring-1 ring-line/80">QR-меню</div>
        <div className="rounded-3xl bg-card/75 p-4 ring-1 ring-line/80">Замовлення</div>
        <div className="rounded-3xl bg-card/75 p-4 ring-1 ring-line/80">Оплата</div>
      </div>
    </div>
  );
}
