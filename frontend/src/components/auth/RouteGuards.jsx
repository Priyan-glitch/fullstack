import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { AUTH_ROUTES, STUDENT_HOME, ADMIN_HOME } from '../../config/auth';
import PageLoader from '../common/PageLoader';

const homeFor = (isAdmin) => (isAdmin ? ADMIN_HOME : STUDENT_HOME);

/**
 * Blocks a route until the stored session has been resolved, then enforces the role.
 * `allow` lists the roles permitted to render `children`.
 */
export function ProtectedRoute({ allow, children }) {
  const { loading, isAuthenticated, isAdmin } = useUser();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    const target = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`${AUTH_ROUTES.signIn}?redirect_url=${encodeURIComponent(target)}`}
        replace
      />
    );
  }

  if (allow && !allow.includes(isAdmin ? 'admin' : 'student')) {
    return <Navigate to={homeFor(isAdmin)} replace />;
  }

  return children;
}

/** Keeps signed-in users off the auth screens. */
export function GuestOnly({ children }) {
  const { loading, isAuthenticated, isAdmin } = useUser();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={homeFor(isAdmin)} replace />;

  return children;
}

/** Entry point: sends each visitor to the right place for their role. */
export function RoleRedirect() {
  const { loading, isAuthenticated, isAdmin } = useUser();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={AUTH_ROUTES.signIn} replace />;

  return <Navigate to={homeFor(isAdmin)} replace />;
}
