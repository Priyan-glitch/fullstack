/**
 * The one place the JWT is stored.
 *
 * Held in memory so apiFetch can read it synchronously, and mirrored into
 * localStorage so a refresh does not sign the user out. Keeping every write
 * behind this module means "am I signed in?" has exactly one answer.
 *
 * Nothing here verifies the signature — that is the gateway's job. These helpers
 * only decode, to read the role and expire the UI early.
 */

const STORAGE_KEY = 'stable-roomies.token';

let cached;

function read() {
  if (cached !== undefined) return cached;
  try {
    cached = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode or storage disabled: memory-only session.
    cached = null;
  }
  return cached;
}

export function getToken() {
  return read();
}

export function setToken(next) {
  cached = next || null;
  try {
    if (cached) window.localStorage.setItem(STORAGE_KEY, cached);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore: the in-memory copy still works for this tab.
  }
}

export function clearToken() {
  setToken(null);
}

/** Decodes the payload segment. Returns null for anything malformed. */
export function decodeToken(value = getToken()) {
  if (!value) return null;

  const parts = value.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

/** Treats a token with no `exp` as expired rather than trusting it forever. */
export function isTokenExpired(value = getToken()) {
  const claims = decodeToken(value);
  if (!claims?.exp) return true;
  return claims.exp * 1000 <= Date.now();
}
