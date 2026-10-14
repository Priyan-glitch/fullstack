import BrandMark from './BrandMark';

/** Full-viewport brand splash shown while the stored session is resolved. */
export default function PageLoader({ label = 'Loading your workspace…' }) {
  return (
    <div
      className="min-h-dvh w-full flex flex-col items-center justify-center gap-6 bg-[#fbfcfb]"
      role="status"
      aria-live="polite"
    >
      <BrandMark size="lg" className="animate-pulse" />

      <div className="flex items-center gap-2.5 text-sm text-gray-500">
        <svg
          className="animate-spin w-4 h-4 text-brand-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {label}
      </div>
    </div>
  );
}
