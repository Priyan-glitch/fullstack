import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';

import { ProtectedRoute, GuestOnly, RoleRedirect } from './components/auth/RouteGuards';

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
import RoomAvailabilityPage from './pages/admin/RoomAvailabilityPage';

function AppRoutes() {
  return (
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
              path="/admin/room-availability"
              element={
                <ProtectedRoute allow={['admin']}>
                  <RoomAvailabilityPage />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
