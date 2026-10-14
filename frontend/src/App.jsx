import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react';

import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import {
  CLERK_PUBLISHABLE_KEY,
  clerkUi,
  clerkAppearance,
  clerkLocalization,
  AUTH_ROUTES,
} from './config/clerk';

import { ProtectedRoute, GuestOnly, RoleRedirect } from './components/auth/RouteGuards';
import BrandMark from './components/common/BrandMark';

import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import PlaceholderPage from './pages/PlaceholderPage';

import StudentDashboard from './pages/student/StudentDashboard';
import PreferencesPage from './pages/student/PreferencesPage';
import AllocationPage from './pages/student/AllocationPage';
import ProfilePage from './pages/student/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import HostelsPage from './pages/admin/HostelsPage';
import RoomsPage from './pages/admin/RoomsPage';
import AdminAllocationPage from './pages/admin/AllocationPage';

/** Shown when the build has no Clerk publishable key configured. */
function MissingClerkKey() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#fbfcfb] px-6 py-16 text-center">
      <BrandMark size="lg" />
      <div className="max-w-lg">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Clerk is not configured
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Add your publishable key to{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
            frontend/.env.local
          </code>{' '}
          and restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 px-4 py-3 text-left text-xs text-gray-100">
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_…
        </pre>
      </div>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      ui={clerkUi}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl={AUTH_ROUTES.signIn}
      signUpUrl={AUTH_ROUTES.signUp}
      afterSignOutUrl={AUTH_ROUTES.afterSignOut}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={clerkAppearance}
      localization={clerkLocalization}
    >
      <UserProvider>
        <NotificationProvider>
          <Routes>
            {/* Entry point — routes each visitor by session + role */}
            <Route path="/" element={<RoleRedirect />} />

            {/* Authentication */}
            <Route
              path="/login/*"
              element={
                <GuestOnly>
                  <LoginPage />
                </GuestOnly>
              }
            />
            <Route
              path="/signup/*"
              element={
                <GuestOnly>
                  <SignupPage />
                </GuestOnly>
              }
            />

            {/* Student */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allow={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allow={['student']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/preferences"
              element={
                <ProtectedRoute allow={['student']}>
                  <PreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/allocation"
              element={
                <ProtectedRoute allow={['student']}>
                  <AllocationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/requests"
              element={
                <ProtectedRoute allow={['student']}>
                  <StudentLayout>
                    <PlaceholderPage
                      title="Room change requests"
                      description="Raise a request to swap rooms or roommates and track the warden's decision. The allocation service already exposes the endpoints this screen will use."
                    />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allow={['student']}>
                  <NotFoundPage />
                </ProtectedRoute>
              }
            />

            {/* Admin / warden */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allow={['admin']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hostels"
              element={
                <ProtectedRoute allow={['admin']}>
                  <HostelsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allow={['admin']}>
                  <RoomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/allocation"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminAllocationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminLayout>
                    <PlaceholderPage
                      title="Request queue"
                      description="Review room change requests raised by students, approve or reject them, and keep an audit trail of every decision."
                    />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allow={['admin']}>
                  <NotFoundPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </UserProvider>
    </ClerkProvider>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <MissingClerkKey />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
