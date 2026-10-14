/**
 * Authenticated fetch for the API gateway.
 *
 * The gateway rejects any request under /api/* without a valid JWT, so every API
 * call must carry `Authorization: Bearer <token>`. The token lives in
 * lib/authToken, which is plain module state rather than a React hook — many
 * fetch calls in this app sit in helper functions that cannot call hooks, so
 * reading from module scope keeps the token out of every call site's props.
 */

import { getToken } from './authToken';

let unauthorizedHandler = null;

/**
 * Registers what to do when the gateway rejects the token — normally signing the
 * user out. Optional; without it a 401 just surfaces to the caller.
 */
export function onUnauthorized(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

/**
 * Drop-in replacement for window.fetch that attaches the JWT.
 * An explicit Authorization header is never overwritten.
 */
export async function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });

  // 401 means the token was absent, expired or rejected. Notifying lets the app
  // drop the stale session and show the sign-in screen instead of a bare error.
  // 403 is deliberately excluded: that is a permissions answer, not a session one.
  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  return response;
}
