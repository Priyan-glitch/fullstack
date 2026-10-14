/**
 * Single source of truth for everything Clerk-related:
 * the publishable key, the branded theme, copy overrides and role resolution.
 */

import { ui } from '@clerk/ui';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/** Passed to <ClerkProvider ui={...}> so Clerk's UI ships with the bundle
 *  instead of being fetched from Clerk's CDN at runtime. */
export const clerkUi = ui;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const AUTH_ROUTES = {
  signIn: '/login',
  signUp: '/signup',
  afterSignOut: '/login',
};

export const STUDENT_HOME = '/student/dashboard';
export const ADMIN_HOME = '/admin/dashboard';

// ─── Brand palette ────────────────────────────────────────────────────────────
// Mirrors the `--color-brand-*` scale declared in src/index.css.

export const BRAND = {
  50: '#f2f7ee',
  100: '#e3eeda',
  200: '#c7ddb6',
  300: '#a3c78b',
  400: '#7bab5e',
  500: '#4a7c2c',
  600: '#3a6620',
  700: '#2d5016',
  800: '#24400f',
  900: '#1c3309',
};

const FONT_STACK =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

// ─── Role resolution ──────────────────────────────────────────────────────────

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_ROLE_ALIASES = new Set(['admin', 'warden', 'staff', 'administrator']);

/**
 * Resolve the application role for a Clerk user.
 *
 * Order of precedence:
 *   1. `publicMetadata.role`  (set from the Clerk dashboard / Backend API)
 *   2. `VITE_ADMIN_EMAILS`    (local development escape hatch)
 *   3. `student`              (default)
 *
 * `unsafeMetadata` is deliberately NOT consulted: it is writable by the
 * signed-in user from the browser, so trusting it would let anyone grant
 * themselves the admin role.
 */
export function resolveRole(clerkUser) {
  if (!clerkUser) return null;

  const declared = clerkUser.publicMetadata?.role;
  if (typeof declared === 'string') {
    const normalised = declared.trim().toLowerCase();
    if (ADMIN_ROLE_ALIASES.has(normalised)) return 'admin';
    if (normalised === 'student') return 'student';
  }

  if (ADMIN_EMAILS.length > 0) {
    const emails = [
      clerkUser.primaryEmailAddress?.emailAddress,
      ...(clerkUser.emailAddresses ?? []).map((address) => address.emailAddress),
    ]
      .filter(Boolean)
      .map((email) => email.toLowerCase());

    if (emails.some((email) => ADMIN_EMAILS.includes(email))) return 'admin';
  }

  return 'student';
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

export const clerkLocalization = {
  signIn: {
    start: {
      title: 'Welcome back',
      subtitle: 'Sign in to manage your room and preferences',
    },
  },
  signUp: {
    start: {
      title: 'Create your account',
      subtitle: 'Set up your profile to get matched with compatible roommates',
    },
  },
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const clerkAppearance = {
  variables: {
    colorPrimary: BRAND[700],
    colorPrimaryForeground: '#ffffff',
    colorBackground: '#ffffff',
    colorForeground: '#111827',
    colorMuted: '#f8faf7',
    colorMutedForeground: '#6b7280',
    colorInput: '#f9fafb',
    colorInputForeground: '#111827',
    colorBorder: '#e5e7eb',
    colorRing: 'rgba(45, 80, 22, 0.22)',
    colorDanger: '#dc2626',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorShadow: 'rgba(15, 23, 42, 0.08)',
    colorModalBackdrop: 'rgba(15, 23, 42, 0.55)',
    colorNeutral: '#111827',
    fontFamily: FONT_STACK,
    fontFamilyButtons: FONT_STACK,
    fontSize: '0.875rem',
    borderRadius: '0.75rem',
    spacing: '1rem',
  },
  elements: {
    rootBox: { width: '100%' },

    cardBox: { width: '100%', maxWidth: '27rem', boxShadow: 'none' },
    card: {
      width: '100%',
      maxWidth: '27rem',
      padding: '2rem',
      borderRadius: '1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #edf1ee',
      boxShadow:
        '0 1px 2px rgba(15, 23, 42, 0.04), 0 18px 40px -20px rgba(15, 23, 42, 0.18)',
    },

    header: { textAlign: 'left', marginBottom: '1.5rem' },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    headerSubtitle: { fontSize: '0.875rem', color: '#6b7280', marginTop: '0.375rem' },

    socialButtonsBlockButton: {
      height: '2.75rem',
      borderRadius: '0.625rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      color: '#374151',
      '&:hover': { backgroundColor: '#f9fafb' },
    },
    socialButtonsBlockButtonText: { fontSize: '0.875rem', fontWeight: 500 },

    dividerLine: { backgroundColor: '#f1f5f9' },
    dividerText: { fontSize: '0.75rem', color: '#9ca3af', textTransform: 'lowercase' },

    formFieldLabelRow: { marginBottom: '0.375rem' },
    formFieldLabel: { fontSize: '0.75rem', fontWeight: 500, color: '#4b5563' },
    formFieldInput: {
      height: '2.75rem',
      borderRadius: '0.625rem',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      color: '#111827',
      fontSize: '0.875rem',
      '&:focus': { backgroundColor: '#ffffff' },
    },
    formFieldInputShowPasswordButton: { color: '#9ca3af' },
    formFieldErrorText: { fontSize: '0.75rem', color: '#dc2626' },
    formFieldHintText: { fontSize: '0.75rem', color: '#9ca3af' },
    formResendCodeLink: { color: BRAND[700], fontWeight: 500 },

    formButtonPrimary: {
      height: '2.75rem',
      borderRadius: '0.625rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      background: `linear-gradient(135deg, ${BRAND[700]}, ${BRAND[500]})`,
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
      '&:hover': {
        background: `linear-gradient(135deg, ${BRAND[800]}, ${BRAND[600]})`,
      },
    },
    formButtonReset: { color: BRAND[700], fontWeight: 500 },

    footerAction: { marginTop: '1.25rem' },
    footerActionText: { fontSize: '0.875rem', color: '#6b7280' },
    footerActionLink: {
      color: BRAND[700],
      fontWeight: 600,
      '&:hover': { color: BRAND[800] },
    },
    footer: { background: 'transparent' },

    otpCodeFieldInput: { borderRadius: '0.625rem', border: '1px solid #e5e7eb' },
    identityPreview: { borderRadius: '0.625rem', border: '1px solid #edf1ee' },
    identityPreviewEditButton: { color: BRAND[700] },
    alert: { borderRadius: '0.625rem' },
    alertText: { fontSize: '0.8125rem' },
    logoBox: { height: 'auto', justifyContent: 'flex-start' },

    userButtonBox: { gap: '0.5rem' },
    userButtonTrigger: { borderRadius: '9999px' },
    userButtonAvatarBox: { width: '2rem', height: '2rem' },
    userButtonOuterIdentifier: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
    },
    userButtonPopoverCard: {
      borderRadius: '0.875rem',
      border: '1px solid #edf1ee',
      boxShadow: '0 24px 48px -24px rgba(15, 23, 42, 0.28)',
    },
    userButtonPopoverActionButton: { '&:hover': { backgroundColor: '#f8faf7' } },
    userPreviewMainIdentifier: { fontWeight: 600 },
    userPreviewSecondaryIdentifier: { color: '#6b7280' },
  },
};
