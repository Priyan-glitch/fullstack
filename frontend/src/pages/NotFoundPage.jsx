import { Link } from 'react-router-dom';
import BrandMark from '../components/common/BrandMark';
import { useUser } from '../contexts/UserContext';
import { AUTH_ROUTES, STUDENT_HOME, ADMIN_HOME } from '../config/auth';

export default function NotFoundPage() {
  const { isAuthenticated, isAdmin } = useUser();

  const home = !isAuthenticated
    ? AUTH_ROUTES.signIn
    : isAdmin
      ? ADMIN_HOME
      : STUDENT_HOME;

  const homeLabel = isAuthenticated ? 'Back to dashboard' : 'Go to sign in';

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-8 bg-[#fbfcfb] px-6 py-16 text-center">
      <BrandMark size="lg" />

      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Error 404
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          The link may be out of date, or the page may have moved. Check the
          address and try again.
        </p>
      </div>

      <Link
        to={home}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        {homeLabel}
      </Link>
    </div>
  );
}
