import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useClerk, useUser as useClerkUser } from '@clerk/react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { resolveRole, AUTH_ROUTES } from '../config/clerk';

const UserContext = createContext(null);

/** How long to wait for the student-service profile lookup before giving up. */
const PROFILE_LOOKUP_TIMEOUT_MS = 8000;

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * Bridges Clerk (identity) with the student-service (application data).
 *
 * Clerk owns authentication; the backend owns the student record. The record is
 * located by email so that `user.id` stays the numeric id every existing API
 * call already expects. When the backend is unreachable the Clerk identity is
 * exposed instead, so the UI still renders instead of hanging.
 */
export const UserProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useClerkUser();
  const { signOut } = useClerk();

  const [record, setRecord] = useState(null);
  const [lookup, setLookup] = useState({ email: null, done: false });

  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const role = useMemo(() => resolveRole(clerkUser), [clerkUser]);

  // Admins have no student record, so only students trigger the lookup.
  const needsLookup =
    isLoaded && isSignedIn === true && role === 'student' && Boolean(email);

  const lookupPending =
    needsLookup && !(lookup.email === email && lookup.done);

  useEffect(() => {
    if (!needsLookup) return undefined;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROFILE_LOOKUP_TIMEOUT_MS);

    (async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.STUDENT_BY_EMAIL(encodeURIComponent(email))}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`student lookup failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled) setRecord(data?.data ?? data);
      } catch (error) {
        if (!error?.name?.includes('Abort')) {
          console.warn(
            `[auth] no student record for ${email}; falling back to the Clerk identity.`,
            error.message,
          );
        }
        if (!cancelled) setRecord(null);
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLookup({ email, done: true });
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [needsLookup, email]);

  const logout = useCallback(
    () => signOut({ redirectUrl: AUTH_ROUTES.afterSignOut }),
    [signOut],
  );

  /** Merges a backend student payload (e.g. a profile update) into context. */
  const updateUser = useCallback((patch) => {
    if (!patch) return;
    setRecord((previous) => ({ ...(previous ?? {}), ...patch }));
  }, []);

  const user = useMemo(() => {
    if (!clerkUser) return null;
    const profile = record ?? {};

    return {
      ...profile,
      // Numeric backend id when the record exists, Clerk id otherwise.
      id: profile.id ?? clerkUser.id,
      clerkId: clerkUser.id,
      firstName: profile.firstName || clerkUser.firstName || '',
      lastName: profile.lastName || clerkUser.lastName || '',
      email: profile.email || email || '',
      phone: profile.phone || clerkUser.primaryPhoneNumber?.phoneNumber || '',
      imageUrl: clerkUser.imageUrl,
      role,
    };
  }, [clerkUser, record, role, email]);

  const loading =
    !isLoaded || (isSignedIn === true && lookupPending);

  const value = {
    user,
    role,
    loading,
    /** True when the backend student record was found. */
    hasProfile: Boolean(record?.id),
    isAuthenticated: isSignedIn === true,
    isStudent: role === 'student',
    isAdmin: role === 'admin',
    logout,
    updateUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
