import { useSearchParams } from 'react-router';
import Form from './Form';

interface PopupProps {
  maxPlayersCount: number;
}

export default function Popup({ maxPlayersCount }: PopupProps) {
  const [, setSearchParams] = useSearchParams();

  const handleClose = () => {
    setSearchParams({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4"
      style={{
        backdropFilter: 'blur(30px)',
        background: 'rgba(28, 27, 27, 0.4)',
      }}
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      role="dialog"
      aria-modal
      tabIndex={0}
    >
      <div
        className="relative w-full max-w-[480px] rounded-3xl px-8 pt-[72px] pb-12 shadow-xl"
        style={{ background: 'linear-gradient(0deg, #141414 0%, #1F1D1D 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-8 top-8 p-1 text-gray hover:text-white transition-colors cursor-pointer"
          aria-label="Закрити"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.707153 14.707L14.7071 0.707059" stroke="currentColor" strokeWidth="2" />
            <path d="M0.707153 0.707031L14.7071 14.707" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <h2
          className="mb-6 font-extrabold text-white"
          style={{
            fontSize: '40px',
            lineHeight: '120%',
            letterSpacing: 0,
            fontVariantNumeric: 'lining-nums proportional-nums',
          }}
        >
          Заявка на гру
        </h2>
        <Form maxPlayersCount={maxPlayersCount} />
      </div>
    </div>
  );
}
