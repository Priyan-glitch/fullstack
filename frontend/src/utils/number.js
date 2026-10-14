/**
 * Rounded percentage of `part` within `total`.
 *
 * Returns `null` — never `NaN` — when the total is missing, zero or not a
 * finite number, so callers can omit the figure instead of rendering "NaN%".
 * This matters on first paint and whenever a backend fetch fails, because the
 * statistics objects default to all-zero.
 */
export function percentOf(part, total) {
  const numerator = Number(part);
  const denominator = Number(total);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator <= 0) return null;

  return Math.round((numerator / denominator) * 100);
}

/** Formats `percentOf` output as "42% of total", or null when unavailable. */
export function percentLabel(part, total, suffix) {
  const value = percentOf(part, total);
  if (value === null) return undefined;
  return suffix ? `${value}% ${suffix}` : `${value}%`;
}
