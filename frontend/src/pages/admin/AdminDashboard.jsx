import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

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

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock data - replace with API calls
  const stats = {
    totalStudents: 500,
    allocatedStudents: 470,
    pendingAllocation: 30,
    totalRooms: 250,
    availableRooms: 15,
    twoSharing: 200,
    threeSharing: 300,
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

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of hostel allocation system</p>
        </div>

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
                subtitle={`${Math.round((stats.allocatedStudents / stats.totalStudents) * 100)}% of total`}
                icon={ClipboardCheckIcon}
                color="green"
              />
              <StatCard
                title="Pending Allocation"
                value={stats.pendingAllocation}
                subtitle={`${Math.round((stats.pendingAllocation / stats.totalStudents) * 100)}% remaining`}
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
                subtitle={`${Math.round((stats.availableRooms / stats.totalRooms) * 100)}% vacant`}
                icon={HomeIcon}
                color="gray"
              />
            </div>
          </div>

          {/* Room Type Distribution */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Room Type Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">2-Sharing</p>
                  <p className="text-xl font-bold text-gray-900">{stats.twoSharing}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(stats.twoSharing / (stats.twoSharing + stats.threeSharing)) * 100}%`,
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
                      width: `${(stats.threeSharing / (stats.twoSharing + stats.threeSharing)) * 100}%`,
                      background: 'linear-gradient(90deg, #4a7c2c, #5a9a3a)'
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
