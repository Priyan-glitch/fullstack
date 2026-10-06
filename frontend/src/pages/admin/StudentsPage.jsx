import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

// Simple icon components
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);

  // Mock student data - replace with API call
  const [students] = useState([
    {
      id: 1,
      name: 'Arjun Kumar',
      registerNo: '21IT001',
      department: 'IT',
      year: 3,
      email: 'arjun@example.com',
      phone: '+91 98765 43210',
      roomType: '2-Sharing',
      status: 'Allocated',
      roomNumber: '204',
      active: true,
      preferences: {
        sleepTime: 'Late (After 12 AM)',
        wakeUpTime: 'Late (After 9 AM)',
        noisePreference: 'Moderate',
        cleanliness: 8,
        studyFrequency: 'Frequently in room',
        socialPreference: 'Moderate',
      }
    },
    {
      id: 2,
      name: 'Priya Sharma',
      registerNo: '21IT002',
      department: 'IT',
      year: 3,
      email: 'priya@example.com',
      phone: '+91 98765 43211',
      roomType: '3-Sharing',
      status: 'Pending',
      roomNumber: null,
      active: true,
      preferences: {
        sleepTime: 'Early (Before 11 PM)',
        wakeUpTime: 'Early (Before 7 AM)',
        noisePreference: 'Quiet',
        cleanliness: 10,
        studyFrequency: 'Often outside',
        socialPreference: 'Introverted',
      }
    },
    {
      id: 3,
      name: 'Mohamed Rahman',
      registerNo: '21CS003',
      department: 'CSE',
      year: 3,
      email: 'mohamed@example.com',
      phone: '+91 98765 43212',
      roomType: '2-Sharing',
      status: 'Allocated',
      roomNumber: '305',
      active: true,
      preferences: {
        sleepTime: 'Moderate (11 PM - 12 AM)',
        wakeUpTime: 'Moderate (7 AM - 9 AM)',
        noisePreference: 'Moderate',
        cleanliness: 7,
        studyFrequency: 'Frequently in room',
        socialPreference: 'Moderate',
      }
    },
    {
      id: 4,
      name: 'Ananya Reddy',
      registerNo: '21ECE004',
      department: 'ECE',
      year: 2,
      email: 'ananya@example.com',
      phone: '+91 98765 43213',
      roomType: '3-Sharing',
      status: 'Pending',
      roomNumber: null,
      active: false,
      preferences: {
        sleepTime: 'Late (After 12 AM)',
        wakeUpTime: 'Late (After 9 AM)',
        noisePreference: 'Lively',
        cleanliness: 6,
        studyFrequency: 'Mix of both',
        socialPreference: 'Extroverted',
      }
    },
  ]);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.registerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesRoomType = roomTypeFilter === 'all' || student.roomType === roomTypeFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesRoomType;
  });

  const handleToggleActive = (studentId) => {
    // In real app, make API call to toggle student active status
    console.log('Toggle active status for student:', studentId);
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowPreferences(false);
  };

  const handleViewPreferences = (student) => {
    setSelectedStudent(student);
    setShowPreferences(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setShowPreferences(false);
  };

  const getStatusBadge = (status) => {
    const configs = {
      'Allocated': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
      'Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
      'Processing': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
    };
    const config = configs[status] || configs['Pending'];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">View and manage student information</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, register no, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Allocated">Allocated</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>
            </div>

            {/* Room Type Filter */}
            <div>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Room Types</option>
                <option value="2-Sharing">2-Sharing</option>
                <option value="3-Sharing">3-Sharing</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            {(searchQuery || departmentFilter !== 'all' || statusFilter !== 'all' || roomTypeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('all');
                  setStatusFilter('all');
                  setRoomTypeFilter('all');
                }}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
              >
                <RefreshIcon className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Register No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">{student.registerNo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{student.department}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{student.roomType}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-4 py-3">
                      {student.roomNumber ? (
                        <span className="text-sm font-medium text-gray-900">{student.roomNumber}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewPreferences(student)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
                          title="View Preferences"
                        >
                          <HeartIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(student.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            student.active 
                              ? 'text-emerald-600 hover:bg-emerald-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={student.active ? 'Deactivate Student' : 'Activate Student'}
                        >
                          {student.active ? (
                            <CheckCircleIcon className="w-4 h-4" />
                          ) : (
                            <XCircleIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No students found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {showPreferences ? 'Student Preferences' : 'Student Profile'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedStudent.name}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {showPreferences ? (
                /* Preferences View */
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Room Preference</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{selectedStudent.roomType}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Sleep & Routine</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sleep Time:</span>
                        <span className="font-medium text-gray-900">{selectedStudent.preferences.sleepTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Wake Up Time:</span>
                        <span className="font-medium text-gray-900">{selectedStudent.preferences.wakeUpTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Lifestyle Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Noise Preference:</span>
                        <span className="font-medium text-gray-900">{selectedStudent.preferences.noisePreference}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cleanliness Level:</span>
                        <span className="font-medium text-gray-900">{selectedStudent.preferences.cleanliness}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Study Frequency:</span>
                        <span className="font-medium text-gray-900">{selectedStudent.preferences.studyFrequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Social Preference:</span>
                        <span className="font-medium text-gray-900">{selectedStudent.preferences.socialPreference}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Profile View */
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                      <p className="text-sm text-gray-500">{selectedStudent.registerNo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Year</p>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.year}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Room Type</p>
                      <p className="text-sm font-medium text-gray-900">{selectedStudent.roomType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      {getStatusBadge(selectedStudent.status)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Room Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedStudent.roomNumber || 'Not Allocated'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Account Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedStudent.active 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {selectedStudent.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                {showPreferences ? '← Back to Profile' : 'View Preferences →'}
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
