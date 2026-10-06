import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import PreferencesPage from './pages/student/PreferencesPage';
import AllocationPage from './pages/student/AllocationPage';
import ProfilePage from './pages/student/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import HostelsPage from './pages/admin/HostelsPage';
import RoomsPage from './pages/admin/RoomsPage';
import AdminAllocationPage from './pages/admin/AllocationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/student/preferences" element={<PreferencesPage />} />
        <Route path="/student/allocation" element={<AllocationPage />} />
        {/* TODO: /student/requests */}

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/hostels" element={<HostelsPage />} />
        <Route path="/admin/rooms" element={<RoomsPage />} />
        <Route path="/admin/allocation" element={<AdminAllocationPage />} />
        {/* TODO: /admin/requests */}
      </Routes>
    </BrowserRouter>
  );
}
