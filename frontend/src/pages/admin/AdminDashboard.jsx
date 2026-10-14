import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { API_BASE_URL, HOSTEL_API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { percentLabel } from '../../utils/number';
import { apiFetch } from '../../lib/http';

// Simple icon components
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BuildingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ClipboardCheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CogIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    allocatedStudents: 0,
    pendingAllocation: 0,
    totalRooms: 0,
    availableRooms: 0,
    twoSharing: 0,
    threeSharing: 0,
    fourSharing: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student stats (student-service :8081)
      const studentResponse = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_STATS}`);
      if (!studentResponse.ok) {
        throw new Error(`student-service responded with ${studentResponse.status}`);
      }
      const studentData = await studentResponse.json();

      // Fetch hostel/room stats (hostel-service :8082)
      const hostelResponse = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.HOSTEL_STATS}`);
      if (!hostelResponse.ok) {
        throw new Error(`hostel-service responded with ${hostelResponse.status}`);
      }
      const hostelData = await hostelResponse.json();

      setStats({
        totalStudents: studentData.totalStudents || 0,
        allocatedStudents: studentData.allocatedStudents || 0,
        pendingAllocation: studentData.pendingAllocation || 0,
        totalRooms: hostelData.totalRooms || 0,
        availableRooms: hostelData.availableRooms || 0,
        twoSharing: hostelData.twoSharing || 0,
        threeSharing: hostelData.threeSharing || 0,
        fourSharing: hostelData.fourSharing || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // A TypeError means fetch never reached a server at all.
      setError(
        err instanceof TypeError
          ? 'Cannot reach the backend services. Start student-service (:8081) and hostel-service (:8082), then press Refresh.'
          : `Failed to load dashboard data — ${err.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-600', text: 'text-blue-700' },
      green: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-700' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', text: 'text-amber-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-600', text: 'text-purple-700' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-100', icon: 'text-gray-600', text: 'text-gray-700' },
    };

    const c = colorClasses[color] || colorClasses.blue;

    return (
      <div className={`bg-white rounded-xl border ${c.border} p-4`}>
        <div className="flex items-start justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${c.icon}`} />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    );
  };

  const ActionButton = ({ label, icon: Icon, onClick, variant = 'primary' }) => {
    const variantClasses = {
      primary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
      success: 'text-white',
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${variantClasses[variant]}`}
        style={variant === 'success' ? { background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' } : {}}
      >
        <Icon className="w-5 h-5" />
        {label}
      </button>
    );
  };

  const allocatedPercent = percentLabel(stats.allocatedStudents, stats.totalStudents, 'of total');
  const pendingPercent = percentLabel(stats.pendingAllocation, stats.totalStudents, 'remaining');
  const vacantPercent = percentLabel(stats.availableRooms, stats.totalRooms, 'vacant');

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Overview of hostel allocation system</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Student Statistics */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Student Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={UsersIcon}
                color="blue"
              />
              <StatCard
                title="Allocated Students"
                value={stats.allocatedStudents}
                subtitle={allocatedPercent}
                icon={ClipboardCheckIcon}
                color="green"
              />
              <StatCard
                title="Pending Allocation"
                value={stats.pendingAllocation}
                subtitle={pendingPercent}
                icon={ClockIcon}
                color="amber"
              />
            </div>
          </div>

          {/* Room Statistics */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Room Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Total Rooms"
                value={stats.totalRooms}
                icon={BuildingIcon}
                color="purple"
              />
              <StatCard
                title="Available Rooms"
                value={stats.availableRooms}
                subtitle={vacantPercent}
                icon={HomeIcon}
                color="gray"
              />
            </div>
          </div>

          {/* Room Type Distribution */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Room Type Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">2-Sharing</p>
                  <p className="text-xl font-bold text-gray-900">{stats.twoSharing}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${stats.twoSharing > 0 ? (stats.twoSharing / (stats.twoSharing + stats.threeSharing + stats.fourSharing)) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #2d5016, #4a7c2c)'
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">3-Sharing</p>
                  <p className="text-xl font-bold text-gray-900">{stats.threeSharing}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${stats.threeSharing > 0 ? (stats.threeSharing / (stats.twoSharing + stats.threeSharing + stats.fourSharing)) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #4a7c2c, #5a9a3a)'
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">4-Sharing</p>
                  <p className="text-xl font-bold text-gray-900">{stats.fourSharing}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${stats.fourSharing > 0 ? (stats.fourSharing / (stats.twoSharing + stats.threeSharing + stats.fourSharing)) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #5a9a3a, #6db04a)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionButton
                label="Manage Students"
                icon={UsersIcon}
                onClick={() => navigate('/admin/students')}
              />
              <ActionButton
                label="Manage Hostels"
                icon={BuildingIcon}
                onClick={() => navigate('/admin/hostels')}
              />
              <ActionButton
                label="Manage Rooms"
                icon={HomeIcon}
                onClick={() => navigate('/admin/rooms')}
              />
              <ActionButton
                label="Generate Allocation"
                icon={CogIcon}
                onClick={() => navigate('/admin/allocation')}
                variant="success"
              />
              <ActionButton
                label="View Allocations"
                icon={CheckCircleIcon}
                onClick={() => navigate('/admin/allocation')}
              />
              <ActionButton
                label="Requests"
                icon={DocumentIcon}
                onClick={() => navigate('/admin/requests')}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
