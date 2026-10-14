import { useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { setAuthTokenGetter } from '../../lib/http';

/**
 * Publishes Clerk's getToken() to the module-level helper in lib/http.js so
 * plain (non-hook) API helpers can attach the session token. Renders nothing.
 *
 * Must be mounted inside ClerkProvider — see App.jsx.
 */
export default function ApiAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}
