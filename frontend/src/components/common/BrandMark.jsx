const SIZES = {
  sm: { box: 'w-7 h-7 rounded-lg', icon: 'w-3.5 h-3.5', name: 'text-sm' },
  md: { box: 'w-9 h-9 rounded-xl', icon: 'w-5 h-5', name: 'text-base' },
  lg: { box: 'w-11 h-11 rounded-xl', icon: 'w-6 h-6', name: 'text-xl' },
};

export function BrandGlyph({ className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

/**
 * The Stable Roomies lockup: gradient tile + wordmark, with an optional role badge.
 * Shared by the auth screens and both app shells so the brand stays identical.
 *
 * `tone="light"` renders for dark/green backgrounds.
 */
export default function BrandMark({
  size = 'md',
  tone = 'dark',
  showName = true,
  badge,
  className = '',
}) {
  const scale = SIZES[size] ?? SIZES.md;
  const isLight = tone === 'light';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`flex items-center justify-center flex-shrink-0 ${scale.box} ${
          isLight
            ? 'bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm'
            : 'text-white'
        }`}
        style={
          isLight
            ? undefined
            : { background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }
        }
      >
        <BrandGlyph className={scale.icon} />
      </div>

      {showName && (
        <div className="flex items-center">
          <span
            className={`font-semibold tracking-tight ${scale.name} ${
              isLight ? 'text-white' : 'text-gray-900'
            }`}
          >
            Stable Roomies
          </span>
          {badge && (
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium border ${
                isLight
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-brand-50 text-brand-700 border-brand-100'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
