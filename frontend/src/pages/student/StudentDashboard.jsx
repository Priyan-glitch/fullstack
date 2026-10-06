import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';

// ─── Placeholder data ─────────────────────────────────────────────────────────
// Replace with real API data when backend is ready.
// allocationStatus: 'not_started' | 'pending' | 'processing' | 'allocated'

const student = {
  name: 'Kathir',
  rollNumber: 'CS2021042',
  department: 'Computer Science',
  email: 'kathir@example.com',
  profileComplete: true,
  profilePercent: 100,
  preferencesSubmitted: true,
  roomPreference: '3-Sharing',
  allocationStatus: 'pending', // ← change this to test different states
  room: null,
  // allocationStatus: 'allocated'  →  uncomment room below
  // room: {
  //   number: '204',
  //   block: 'A',
  //   floor: 2,
  //   type: '3-Sharing',
  //   roommates: [
  //     { name: 'Arjun S', department: 'IT', initials: 'A' },
  //     { name: 'Mohamed R', department: 'ECE', initials: 'M' },
  //   ],
  // },
  preferences: {
    sleep: 'Late sleeper',
    cleanliness: 'High',
    noise: 'Quiet',
    study: 'Frequently in room',
    social: 'Moderate',
  },
  recentActivity: [
    { label: 'Questionnaire submitted', date: '06 Oct 2026' },
    { label: 'Room type selected', date: '06 Oct 2026' },
    { label: 'Profile completed', date: '05 Oct 2026' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusCard({ title, value, state, action, onAction }) {
  const configs = {
    success: { dot: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    warning: { dot: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
    info:    { dot: 'bg-blue-400',    text: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
    neutral: { dot: 'bg-gray-300',    text: 'text-gray-500',    bg: 'bg-gray-50',    border: 'border-gray-100'    },
  };
  const c = configs[state] || configs.neutral;

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-4 flex flex-col gap-3`}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
        <span className={`text-sm font-semibold ${c.text}`}>{value}</span>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-medium text-green-700 hover:text-green-800 text-left transition-colors cursor-pointer"
        >
          {action} →
        </button>
      )}
    </div>
  );
}

function AllocationCard({ status, room, onViewRoom }) {
  if (status === 'allocated' && room) {
    return (
      <div className="bg-white rounded-xl border border-emerald-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Your Room</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900">Room {room.number}</span>
              <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                Allocated
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Block {room.block} · Floor {room.floor} · {room.type}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Your Roommates</p>
          <div className="flex gap-3">
            {room.roommates.map((r) => (
              <div key={r.name} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                  {r.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onViewRoom}
          className="w-full text-sm font-semibold text-white py-2.5 rounded-lg transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
        >
          View Room Details
        </button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="bg-white rounded-xl border border-blue-100 p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Allocation Status</p>
        <div className="flex items-center gap-2.5 mb-2">
          <svg className="animate-spin w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-base font-semibold text-blue-700">Allocation in Progress</p>
        </div>
        <p className="text-sm text-gray-500">Your roommate allocation is being processed. This usually takes a few minutes.</p>
      </div>
    );
  }

  // pending or not_started
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Allocation Status</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <p className="text-base font-semibold text-amber-700">Allocation Pending</p>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        Your preferences have been submitted successfully. The administrator has not yet published the room allocation.
      </p>
    </div>
  );
}

function RoomPreferenceCard({ value, onEdit }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Room Preference</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">Your selected room type</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2d5016" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="text-xs font-medium text-green-700 hover:text-green-800 text-left transition-colors cursor-pointer"
      >
        Edit preference →
      </button>
    </div>
  );
}

function PreferenceSummaryCard({ preferences, onView }) {
  const rows = [
    { label: 'Sleep',       value: preferences.sleep },
    { label: 'Cleanliness', value: preferences.cleanliness },
    { label: 'Noise',       value: preferences.noise },
    { label: 'Study',       value: preferences.study },
    { label: 'Social',      value: preferences.social },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Your Preferences</p>
      <div className="space-y-2.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-gray-800 text-right">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <button
          onClick={onView}
          className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors cursor-pointer"
        >
          View all preferences →
        </button>
      </div>
    </div>
  );
}

function ActionRequired({ status, profilePercent, onAction }) {
  if (status === 'allocated') return null;

  if (!profilePercent || profilePercent < 100) {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-500 mt-0.5 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">Complete your profile</p>
          <p className="text-xs text-amber-600 mt-0.5">Your profile is {profilePercent}% complete. Finish it before allocation begins.</p>
        </div>
        <button onClick={onAction} className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer whitespace-nowrap">
          Complete now →
        </button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-700 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-sm text-green-800">
          <span className="font-medium">No action required.</span> Your allocation will be published by the admin.
        </p>
      </div>
    );
  }

  return null;
}

function RecentActivity({ activity }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Recent Activity</p>
      <div className="space-y-3">
        {activity.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#10b981" className="w-3 h-3">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();

  const { allocationStatus } = student;

  const statusCards = [
    {
      title: 'Profile',
      value: student.profileComplete ? 'Complete' : `${student.profilePercent}% Complete`,
      state: student.profileComplete ? 'success' : 'warning',
      action: student.profileComplete ? null : 'Complete profile',
      onAction: () => navigate('/student/profile'),
    },
    {
      title: 'Preferences',
      value: student.preferencesSubmitted ? 'Submitted' : 'Not Submitted',
      state: student.preferencesSubmitted ? 'success' : 'warning',
      action: student.preferencesSubmitted ? null : 'Complete now',
      onAction: () => navigate('/student/preferences'),
    },
    {
      title: 'Allocation',
      value:
        allocationStatus === 'allocated'   ? 'Allocated'   :
        allocationStatus === 'processing'  ? 'Processing'  :
        allocationStatus === 'pending'     ? 'Pending'     :
                                             'Not Started',
      state:
        allocationStatus === 'allocated'   ? 'success' :
        allocationStatus === 'processing'  ? 'info'    :
        allocationStatus === 'pending'     ? 'warning' :
                                             'neutral',
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {student.name} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's your hostel allocation overview.</p>
        </div>

        {/* Action required banner */}
        <ActionRequired
          status={allocationStatus}
          profilePercent={student.profilePercent}
          onAction={() => navigate('/student/profile')}
        />

        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusCards.map((card) => (
            <StatusCard key={card.title} {...card} />
          ))}
        </div>

        {/* Main content grid - 2 columns on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main allocation and preferences */}
          <div className="lg:col-span-2 space-y-6">
            {/* Allocation Card */}
            <AllocationCard
              status={allocationStatus}
              room={student.room}
              onViewRoom={() => navigate('/student/allocation')}
            />

            {/* Preference summary */}
            {student.preferencesSubmitted && (
              <PreferenceSummaryCard
                preferences={student.preferences}
                onView={() => navigate('/student/preferences')}
              />
            )}
          </div>

          {/* Right column - Room preference and activity */}
          <div className="space-y-6">
            <RoomPreferenceCard
              value={student.roomPreference}
              onEdit={() => navigate('/student/preferences')}
            />
            
            <RecentActivity activity={student.recentActivity} />
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
