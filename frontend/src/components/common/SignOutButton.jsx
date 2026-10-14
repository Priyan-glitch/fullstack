import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { AUTH_ROUTES } from '../../config/auth';

/**
 * Ends the session and returns to the sign-in screen.
 *
 * With tokens issued by auth-service there is no remote session to tear down —
 * clearing the stored JWT is the whole of signing out.
 */
export default function SignOutButton() {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate(AUTH_ROUTES.afterSignOut, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
      aria-label="Sign out"
      title="Sign out"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
        />
      </svg>
    </button>
  );
}
