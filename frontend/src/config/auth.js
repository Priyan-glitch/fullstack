/** Routes and constants for the self-hosted auth server. */

export const AUTH_ROUTES = {
  signIn: '/login',
  signUp: '/signup',
  /** Where a sign-out lands, and where an expired session bounces to. */
  afterSignOut: '/login',
};

export const STUDENT_HOME = '/student/dashboard';
export const ADMIN_HOME = '/admin/dashboard';

/** Where a signed-in user of this role belongs. */
export const homeFor = (role) => (role === 'admin' ? ADMIN_HOME : STUDENT_HOME);
