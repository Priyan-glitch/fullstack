/**
 * Authenticated fetch for the API gateway.
 *
 * The gateway rejects any request under /api/* without a valid Clerk session
 * token, so every API call must carry `Authorization: Bearer <token>`.
 * Clerk exposes getToken() only through a React hook, but a lot of the fetch
 * calls in this app live in plain helper functions, so the hook hands its
 * getToken here once (see ApiAuthBridge) and apiFetch reads it from module
 * scope. That avoids threading the token through every call site's props.
 */

let tokenGetter = null;

/** Called by ApiAuthBridge with Clerk's getToken. */
export function setAuthTokenGetter(getter) {
  tokenGetter = typeof getter === 'function' ? getter : null;
}

async function authorizationHeader() {
  if (!tokenGetter) return null;

  try {
    const token = await tokenGetter();
    return token ? `Bearer ${token}` : null;
  } catch (error) {
    // A failure here means Clerk has no usable session; let the request go
    // through untokenised so the gateway answers 401 and the UI shows a
    // sign-in prompt rather than a network error.
    console.warn('Could not read Clerk session token:', error);
    return null;
  }
}

/**
 * Drop-in replacement for window.fetch that attaches the Clerk session token.
 * An explicit Authorization header is never overwritten.
 */
export async function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const authorization = await authorizationHeader();

  if (authorization && !headers.has('Authorization')) {
    headers.set('Authorization', authorization);
  }

  return fetch(input, { ...init, headers });
}
