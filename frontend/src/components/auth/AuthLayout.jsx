import BrandMark from '../common/BrandMark';

const FEATURES = [
  {
    title: 'Compatibility scoring',
    body: 'Sleep, study and cleanliness habits are scored and weighted.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    ),
  },
  {
    title: 'Room & block preferences',
    body: 'Floor, sharing type and amenities captured in one questionnaire.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
      />
    ),
  },
  {
    title: 'Warden-approved allocations',
    body: 'Suggested groups stay reviewable before any room is assigned.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    ),
  },
];

function PanelBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        className="absolute -top-32 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(163,199,139,0.55), transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-36 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(12,24,4,0.85), transparent 72%)',
        }}
      />
    </div>
  );
}

/**
 * Split-screen shell for the sign-in and sign-up screens.
 * Desktop: brand story on the left, sign-in form on the right.
 * Mobile: a compact brand band above the form.
 */
export default function AuthLayout({ children }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-dvh w-full bg-[#fbfcfb] lg:flex">
      {/* ── Brand panel — desktop only ─────────────────────────────────────── */}
      <aside
        className="relative hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col justify-between overflow-hidden px-12 py-12 text-white xl:px-16"
        style={{
          background: 'linear-gradient(150deg, #16290a 0%, #2d5016 48%, #3f6b24 100%)',
        }}
      >
        <PanelBackdrop />

        <div className="relative">
          <BrandMark size="md" tone="light" />
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
            Hostel roommate allocation
          </p>
          <h1 className="mt-4 text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white">
            Rooms that fit the way you actually live.
          </h1>
          <p className="mt-4 text-sm xl:text-base leading-relaxed text-brand-100/90">
            Stable Roomies turns student preference questionnaires into weighted
            compatibility scores, then proposes roommate groups your wardens can
            review before anything is confirmed.
          </p>

          <ul className="mt-9 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.6}
                    stroke="currentColor"
                    className="h-4 w-4 text-brand-100"
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="text-xs leading-relaxed text-brand-100/75">
                    {feature.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-xs text-brand-100/70">
          <span>© {year} Stable Roomies</span>
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Secured by JWT authentication
          </span>
        </div>
      </aside>

      {/* ── Form column ───────────────────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-1 flex-col lg:min-h-0">
        {/* Mobile brand band */}
        <header className="lg:hidden px-5 pt-8 pb-2 sm:px-8">
          <BrandMark size="sm" />
          <p className="mt-3 text-sm text-gray-500">
            Smart hostel roommate allocation for students and wardens.
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="lg:hidden px-5 pb-7 text-center text-xs text-gray-400 sm:px-8">
          © {year} Stable Roomies · Secured by JWT authentication
        </footer>
      </div>
    </div>
  );
}
