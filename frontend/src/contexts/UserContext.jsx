import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { apiFetch, onUnauthorized } from '../lib/http';
import { clearToken, getToken, isTokenExpired, setToken } from '../lib/authToken';

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
 * Turns an auth-service error envelope — `{ status, message, errors? }` — into a
 * single string a form can display. Field-level errors win, since "Password must
 * be at least 8 characters" is more useful than "Please check the fields".
 */
async function readErrorMessage(response, fallback) {
  try {
    const body = await response.json();
    const firstFieldError = body?.errors ? Object.values(body.errors)[0] : null;
    if (typeof firstFieldError === 'string' && firstFieldError) return firstFieldError;
    if (typeof body?.message === 'string' && body.message) return body.message;
  } catch {
    // Non-JSON body (a proxy error page, say) — fall through to the fallback.
  }
  return fallback;
}

/**
 * Authentication is handled entirely by auth-service; this provider is the
 * frontend's view of the resulting JWT.
 *
 * It also bridges to the student-service: identity lives in auth-service, but
 * application data lives in the `students` table. The record is located by email
 * so `user.id` stays the numeric student id every existing API call expects.
 */
export const UserProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [record, setRecord] = useState(null);
  const [lookup, setLookup] = useState({ email: null, done: false });

  const role = account?.role ?? null;

  // ── Restore a session on load ──────────────────────────────────────────────
  // The token is only trusted after /me confirms it: it may have been revoked,
  // or signed with a secret this deployment no longer uses.
  useEffect(() => {
    if (!getToken() || isTokenExpired()) {
      clearToken();
      setRestoring(false);
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROFILE_LOOKUP_TIMEOUT_MS);

    (async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`session check returned ${response.status}`);
        }
        const me = await response.json();
        if (!cancelled) setAccount(me);
      } catch (error) {
        if (!cancelled) {
          clearToken();
          setAccount(null);
          if (!controller.signal.aborted) {
            console.warn('[auth] stored session is no longer valid:', error.message);
          }
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // ── Bridge identity to the student record ─────────────────────────────────
  const email = account?.email ?? null;
  const needsLookup = Boolean(email) && role === 'student';
  const lookupPending = needsLookup && !(lookup.email === email && lookup.done);

  useEffect(() => {
    if (!needsLookup) return undefined;

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROFILE_LOOKUP_TIMEOUT_MS);

    (async () => {
      try {
        const response = await apiFetch(
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
            `[auth] no student record for ${email}; falling back to the account identity.`,
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

  const logout = useCallback(() => {
    clearToken();
    setAccount(null);
    setRecord(null);
    setLookup({ email: null, done: false });
  }, []);

  // A rejected token anywhere in the app ends the session, so an expired token
  // cannot leave the UI in a half-signed-in state.
  useEffect(() => {
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  const establishSession = useCallback((auth) => {
    setToken(auth.token);
    setAccount(auth.user);
    return auth.user;
  }, []);

  const login = useCallback(
    async (credentialsEmail, password) => {
      const response = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentialsEmail, password }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Could not sign you in.'));
      }

      return establishSession(await response.json());
    },
    [establishSession],
  );

  const register = useCallback(
    async ({ email: newEmail, password, firstName, lastName }) => {
      const response = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password, firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Could not create your account.'));
      }

      // Registration returns a token too, so signing up signs you in.
      return establishSession(await response.json());
    },
    [establishSession],
  );

  /** Merges a backend student payload (e.g. a profile update) into context. */
  const updateUser = useCallback((patch) => {
    if (!patch) return;
    setRecord((previous) => ({ ...(previous ?? {}), ...patch }));
  }, []);

  const user = useMemo(() => {
    if (!account) return null;
    const profile = record ?? {};

    return {
      ...profile,
      // Numeric student id when the record exists, auth-service id otherwise.
      id: profile.id ?? account.id,
      accountId: account.id,
      firstName: profile.firstName || account.firstName || '',
      lastName: profile.lastName || account.lastName || '',
      email: profile.email || account.email || '',
      role,
    };
  }, [account, record, role]);

  const loading = restoring || (role === 'student' && lookupPending);

  const value = {
    user,
    role,
    loading,
    /** True when the backend student record was found. */
    hasProfile: Boolean(record?.id),
    isAuthenticated: Boolean(account),
    isStudent: role === 'student',
    isAdmin: role === 'admin',
    login,
    register,
    logout,
    updateUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
