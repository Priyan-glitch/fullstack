import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

// Simple icon components
const CogIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function AllocationPage() {
  // View states: 'generate', 'processing', 'proposed', 'final'
  const [view, setView] = useState('generate');
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [expandedRoom, setExpandedRoom] = useState(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    twoSharing: 0,
    threeSharing: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_STATS}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats({
        totalStudents: data.totalStudents || 0,
        twoSharing: data.twoSharing || 0,
        threeSharing: data.threeSharing || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Mock proposed allocation
  const proposedAllocation = [
    {
      roomNumber: '101',
      hostel: 'Boys Hostel A',
      type: '2-Sharing',
      students: [
        { id: 1, name: 'Arjun Kumar', registerNo: '21IT001', compatibility: 92 },
        { id: 2, name: 'Raj Patel', registerNo: '21IT005', compatibility: 92 },
      ],
      avgCompatibility: 92,
    },
    {
      roomNumber: '102',
      hostel: 'Boys Hostel A',
      type: '2-Sharing',
      students: [
        { id: 3, name: 'Mohamed Rahman', registerNo: '21CS003', compatibility: 89 },
        { id: 4, name: 'Karthik S', registerNo: '21CS010', compatibility: 89 },
      ],
      avgCompatibility: 89,
    },
    {
      roomNumber: '201',
      hostel: 'Boys Hostel A',
      type: '3-Sharing',
      students: [
        { id: 5, name: 'Vikram Reddy', registerNo: '21ECE007', compatibility: 91 },
        { id: 6, name: 'Suresh Babu', registerNo: '21ECE015', compatibility: 91 },
        { id: 7, name: 'Rahul Kumar', registerNo: '21ECE022', compatibility: 91 },
      ],
      avgCompatibility: 91,
    },
    {
      roomNumber: '105',
      hostel: 'Girls Hostel A',
      type: '2-Sharing',
      students: [
        { id: 8, name: 'Priya Sharma', registerNo: '21IT002', compatibility: 95 },
        { id: 9, name: 'Ananya Reddy', registerNo: '21ECE004', compatibility: 95 },
      ],
      avgCompatibility: 95,
    },
  ];

  const handleGenerateAllocation = async () => {
    setProcessing(true);
    setProcessedCount(0);
    
    // Simulate processing with progress
    const interval = setInterval(() => {
      setProcessedCount(prev => {
        if (prev >= stats.totalStudents) {
          clearInterval(interval);
          setTimeout(() => {
            setProcessing(false);
            setView('proposed');
          }, 500);
          return stats.totalStudents;
        }
        return prev + 50;
      });
    }, 300);
  };

  const handleApproveAllocation = () => {
    setView('final');
  };

  const handlePublish = () => {
    if (confirm('Are you sure you want to publish this allocation to students? This action will notify all students.')) {
      alert('Allocation published successfully! Students will receive notifications.');
    }
  };

  const getCompatibilityColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Room Allocation</h1>
          <p className="text-sm text-gray-400 mt-0.5">Generate and manage room allocations</p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setView('generate')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'generate' || view === 'processing'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setView('proposed')}
            disabled={view === 'generate' || view === 'processing'}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'proposed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Proposed
          </button>
          <button
            onClick={() => setView('final')}
            disabled={view === 'generate' || view === 'processing' || view === 'proposed'}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'final'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Final
          </button>
        </div>

        {/* Generate View */}
        {view === 'generate' && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Students to Allocate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-2">2-Sharing Preference</p>
                <p className="text-2xl font-bold text-gray-900">{stats.twoSharing}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(stats.twoSharing / stats.totalStudents) * 100}%`,
                      background: 'linear-gradient(90deg, #2d5016, #4a7c2c)',
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-2">3-Sharing Preference</p>
                <p className="text-2xl font-bold text-gray-900">{stats.threeSharing}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(stats.threeSharing / stats.totalStudents) * 100}%`,
                      background: 'linear-gradient(90deg, #4a7c2c, #5a9a3a)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <CogIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Start Allocation Process</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                The algorithm will analyze student preferences and generate optimal room allocations based on compatibility scores.
              </p>
              <button
                onClick={handleGenerateAllocation}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
              >
                <PlayIcon className="w-5 h-5" />
                Generate Allocation
              </button>
            </div>
          </div>
        )}

        {/* Processing View */}
        {view === 'processing' && processing && (
          <div className="bg-white rounded-xl border border-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CogIcon className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Allocation Job</h2>
                <p className="text-sm text-blue-600 font-medium">Status: Processing...</p>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Students Processed</span>
                  <span className="font-bold text-gray-900">{processedCount} / {stats.totalStudents}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${(processedCount / stats.totalStudents) * 100}%`,
                      background: 'linear-gradient(90deg, #2d5016, #4a7c2c)',
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700">
                <p>The allocation algorithm is running in the background. This may take a few minutes depending on the number of students.</p>
              </div>
            </div>
          </div>
        )}

        {/* Proposed View */}
        {view === 'proposed' && (
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Proposed Allocation</h2>
                <p className="text-sm text-gray-500 mt-0.5">Review the generated allocation before approving</p>
              </div>
              <button
                onClick={handleApproveAllocation}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
              >
                <CheckCircleIcon className="w-5 h-5" />
                Approve Allocation
              </button>
            </div>

            {/* Proposed Allocations Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hostel</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Compatibility</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {proposedAllocation.map((room) => (
                    <tr key={room.roomNumber} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-900">{room.roomNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{room.hostel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{room.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {room.students.map(student => (
                            <span key={student.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {student.name.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getCompatibilityColor(room.avgCompatibility)}`}>
                          {room.avgCompatibility}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setExpandedRoom(expandedRoom === room.roomNumber ? null : room.roomNumber)}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded Room Details */}
            {expandedRoom && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                {proposedAllocation
                  .filter(room => room.roomNumber === expandedRoom)
                  .map(room => (
                    <div key={room.roomNumber}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Room {room.roomNumber} - Details</h3>
                        <button
                          onClick={() => setExpandedRoom(null)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {room.students.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.registerNo}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(student.compatibility)}`}>
                              {student.compatibility}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Final View */}
        {view === 'final' && (
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Final Allocation</h2>
                  </div>
                  <p className="text-sm text-emerald-50">
                    Allocation approved and ready to publish to students
                  </p>
                </div>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-white text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  Publish to Students
                </button>
              </div>
            </div>

            {/* Final Allocations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposedAllocation.map((room) => (
                <div key={room.roomNumber} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Room {room.roomNumber}</h3>
                        <p className="text-xs text-gray-500">{room.hostel} • {room.type}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCompatibilityColor(room.avgCompatibility)}`}>
                        {room.avgCompatibility}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {room.students.map((student, idx) => (
                        <div key={student.id} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-gray-400 text-xs">
                              {idx === 0 ? '├──' : idx === room.students.length - 1 ? '└──' : '├──'}
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.registerNo}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
