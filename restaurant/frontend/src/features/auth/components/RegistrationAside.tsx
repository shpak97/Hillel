export function RegistrationAside() {
  return (
    <div className="w-full max-w-[540px]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">
            Setup
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-ink-950">
            Перший акаунт власника прив&apos;язує ресторан до QR-меню.
          </h2>
        </div>
        <span className="rounded-pill bg-brand-50 px-4 py-2 text-sm font-black text-brand-700 ring-1 ring-brand/10">
          Step 1
        </span>
      </div>

      <div className="rounded-[34px] bg-white p-5 shadow-[0_34px_90px_-55px_rgba(23,21,18,0.85)] ring-1 ring-line">
        <div className="rounded-[28px] bg-paper-50 p-5 ring-1 ring-line/60">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold text-ink-400">
                Restaurant profile
              </p>
              <h3 className="mt-1 text-2xl font-black text-ink-950">Bistro 21</h3>
            </div>
            <div className="grid size-16 place-items-center rounded-3xl bg-ink-950 text-[22px] font-black text-white">
              21
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-line">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-ink-950">1. Створити акаунт</p>
                <span className="rounded-pill bg-herb-50 px-3 py-1 text-xs font-black text-herb">
                  активно
                </span>
              </div>
              <div className="mt-3 h-2 rounded-pill bg-paper-100">
                <div className="h-2 w-1/2 rounded-pill bg-herb" />
              </div>
            </div>

            {['2. Підтвердити email', '3. Додати меню'].map((step, index) => (
              <div
                key={step}
                className="rounded-3xl bg-white p-4 ring-1 ring-line"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-ink-950">{step}</p>
                  <span className="rounded-pill bg-paper-100 px-3 py-1 text-xs font-black text-ink-500">
                    {index === 0 ? 'очікує' : 'далі'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[30px] bg-ink-950 p-5 text-white shadow-[0_24px_70px_-48px_rgba(23,21,18,0.9)]">
        <p className="text-sm font-bold text-white/60">Після входу</p>
        <p className="mt-1 text-xl font-black">
          Меню, столи, замовлення та оплати зібрані в одному кабінеті.
        </p>
      </div>
    </div>
  );
}

export function EmailSentAside() {
  return (
    <div className="w-full max-w-[540px]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-herb">
            Email verification
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-ink-950">
            Після підтвердження власник потрапляє в робочий кабінет.
          </h2>
        </div>
        <span className="rounded-pill bg-herb-50 px-4 py-2 text-sm font-black text-herb ring-1 ring-herb/10">
          Step 2
        </span>
      </div>

      <div className="rounded-[34px] bg-white p-5 shadow-[0_34px_90px_-55px_rgba(23,21,18,0.85)] ring-1 ring-line">
        <div className="rounded-[28px] bg-paper-50 p-5 ring-1 ring-line/60">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-ink-400">Inbox preview</p>
              <h3 className="text-2xl font-black text-ink-950">RestoQR</h3>
            </div>
            <span className="rounded-pill bg-herb-50 px-3 py-1 text-xs font-black text-herb">
              новий лист
            </span>
          </div>

          <article className="rounded-3xl bg-white p-5 ring-1 ring-line">
            <p className="text-sm font-black text-ink-950">
              Підтвердіть email для вашого ресторану
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink-600">
              Кнопка в листі активує акаунт і відкриє доступ до налаштування меню.
            </p>
            <div className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-ink-950 px-4 text-sm font-black text-white">
              Підтвердити email
            </div>
          </article>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white p-4 ring-1 ring-line">
              <p className="text-[12px] font-bold text-ink-400">Status</p>
              <p className="mt-1 text-lg font-black text-herb">sent</p>
            </div>
            <div className="rounded-3xl bg-white p-4 ring-1 ring-line">
              <p className="text-[12px] font-bold text-ink-400">Next</p>
              <p className="mt-1 text-lg font-black text-ink-950">login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifyEmailAside() {
  return <EmailSentAside />;
}
