import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { apiFetch } from '../../lib/http';
import { API_BASE_URL, HOSTEL_API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import StudentLayout from '../../layouts/StudentLayout';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialPreferences = {
  roomType: null,
  roomTypePreference1: null,
  roomTypePreference2: null,
  roomTypePreference3: null,
  acPreference: null,            // 'AC', 'NON_AC', 'BOTH'
  preferredRoommateIds: '',      // comma-separated IDs stored as string
  sleepTime: null,
  wakeUpTime: null,
  studyTiming: null,             // 'MORNING_PERSON', 'NIGHT_OWL', 'FLEXIBLE'
  noisePreference: null,
  cleanlinessLevel: 3,
  studyPreference: null,         // 'ALONE', 'GROUP_STUDY', 'DOESNT_MATTER'
  studyFrequency: null,
  studyEnvironment: null,
  socialPreference: null,
  personalSpace: null,
  visitorPreference: null,
};

// ─── Step Configurations ──────────────────────────────────────────────────────

const steps = [
  {
    id: 1,
    title: 'Room Preferences',
    subtitle: 'Choose your preferred room sharing type and AC preference',
  },
  {
    id: 2,
    title: 'Preferred Roommates',
    subtitle: "Search and select students you'd like to room with (optional)",
  },
  {
    id: 3,
    title: 'Sleep & Routine',
    subtitle: 'Tell us about your daily schedule',
  },
  {
    id: 4,
    title: 'Lifestyle Preferences',
    subtitle: 'Help us understand your living preferences',
  },
  {
    id: 5,
    title: 'Review & Submit',
    subtitle: 'Review your preferences before submitting',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
        <span className="text-xs font-medium text-green-700">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function RoomTypeCard({ type, selected, onSelect }) {
  const configs = {
    'INDIVIDUAL': {
      number: '1',
      label: 'Individual',
      description: 'Single occupancy room',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    '2_SHARING': {
      number: '2',
      label: 'Sharing',
      description: 'Room for 2 students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    '3_SHARING': {
      number: '3',
      label: 'Sharing',
      description: 'Room for 3 students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
    '4_SHARING': {
      number: '4',
      label: 'Sharing',
      description: 'Room for 4 students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
  };

  const config = configs[type];
  if (!config) return null;
  const isSelected = selected === type;

  return (
    <button
      onClick={() => onSelect(type)}
      className={`flex-1 p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer text-center
        ${isSelected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <div className={`inline-flex items-center justify-center mb-3 ${isSelected ? 'text-green-700' : 'text-gray-400'}`}>
        {config.icon}
      </div>
      <div className="mb-1">
        <span className={`text-2xl font-bold ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
          {config.number}
        </span>
        <span className={`text-base font-semibold ml-1 ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
          {config.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{config.description}</p>
      <div className={`w-5 h-5 rounded-full border-2 mx-auto transition-colors
        ${isSelected ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}`}>
        {isSelected && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-full h-full">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
}

function AcOptionCard({ type, title, description, selected, onSelect }) {
  const icons = {
    AC: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18 3.75 3.75M12 3 8.25 6.75M12 21l3.75-3.75M12 21l-3.75-3.75m-8.25-9h18m-18 0 3.75-3.75M3.75 12l3.75 3.75M21.75 12l-3.75-3.75M21.75 12l-3.75 3.75" />
      </svg>
    ),
    NON_AC: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
    BOTH: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer flex flex-col justify-between ${
        selected
          ? 'border-green-600 bg-green-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className={`p-2 rounded-lg ${selected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {icons[type]}
          </div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'
          }`}>
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </div>
        <h4 className={`text-sm font-bold ${selected ? 'text-green-900' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

// ─── Roommate Search Step ─────────────────────────────────────────────────────

function RoommateSearchStep({ roomType, selectedRoommates, onUpdateRoommates, currentUserId, currentUserGender }) {
  // maxSlots: INDIVIDUAL=0, 2_SHARING=1, 3_SHARING=2, 4_SHARING=3
  const maxSlots = roomType === 'INDIVIDUAL' ? 0
    : roomType === '2_SHARING' ? 1
    : roomType === '4_SHARING' ? 3
    : 2; // 3_SHARING default
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectError, setSelectError] = useState('');
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchStudents = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    setSelectError('');
    try {
      const genderParam = currentUserGender ? `&gender=${encodeURIComponent(currentUserGender)}` : '';
      const res = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENTS_SEARCH}?query=${encodeURIComponent(q)}${genderParam}`);
      if (res.ok) {
        const data = await res.json();
        // Exclude current user, already-selected roommates, and enforce same gender constraint
        const selectedIds = selectedRoommates.map(r => r.id);
        const filtered = data.filter(s => {
          if (s.id === currentUserId) return false;
          if (selectedIds.includes(s.id)) return false;
          if (currentUserGender && s.gender) {
            return s.gender.trim().toLowerCase() === currentUserGender.trim().toLowerCase();
          }
          return true;
        });
        setResults(filtered.slice(0, 8));
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, [currentUserId, currentUserGender, selectedRoommates]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectError('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchStudents(val), 300);
  };

  const handleSelect = (student) => {
    if (selectedRoommates.length >= maxSlots) return;

    // Strict gender constraint validation
    if (currentUserGender && student.gender && student.gender.trim().toLowerCase() !== currentUserGender.trim().toLowerCase()) {
      setSelectError(
        `Cannot select ${student.firstName} ${student.lastName}: Gender constraint violation. ` +
        `Boys and girls hostels are separate. You can only select ${currentUserGender.toLowerCase()} roommates.`
      );
      return;
    }

    setSelectError('');
    onUpdateRoommates([...selectedRoommates, student]);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemove = (id) => {
    onUpdateRoommates(selectedRoommates.filter(r => r.id !== id));
    setSelectError('');
  };

  const slotsLeft = maxSlots - selectedRoommates.length;
  const isMale = currentUserGender?.toLowerCase() === 'male';
  const isFemale = currentUserGender?.toLowerCase() === 'female';

  if (roomType === 'INDIVIDUAL' || maxSlots === 0) {
    return (
      <div className="py-8 text-center bg-gray-50 rounded-2xl border border-gray-100 p-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Single Occupancy (Individual Room)</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
            You have selected an <strong>Individual</strong> room. Since you will have a private room to yourself, roommate selection is not applicable.
          </p>
        </div>
        <p className="text-xs text-gray-400">Click &ldquo;Next Step&rdquo; below to continue with your lifestyle preferences.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner with Gender Policy */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-blue-900">
              {roomType === '2_SHARING' ? '2-Sharing Room' : '3-Sharing Room'} — Select up to <span className="font-bold">{maxSlots}</span> preferred {maxSlots === 1 ? 'roommate' : 'roommates'}
            </p>
            {currentUserGender && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isMale ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-pink-100 text-pink-800 border border-pink-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMale ? 'bg-blue-600' : 'bg-pink-600'}`}></span>
                {currentUserGender} Hostel Only
              </span>
            )}
          </div>
          <p className="text-xs text-blue-700 mt-1.5 leading-relaxed">
            {currentUserGender ? (
              <>
                Hostels are strictly separated by gender. As a <strong>{currentUserGender.toLowerCase()}</strong> student, you can only choose fellow <strong>{currentUserGender.toLowerCase()}</strong> students. Candidates of different genders are automatically excluded.
              </>
            ) : (
              'Hostels are separated by gender. You can only choose roommates of the same gender.'
            )}
          </p>
        </div>
      </div> */}

      {/* Select Error Alert */}
      {selectError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 1 0 1.06 1.06L10 11.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L11.06 10l2.72-2.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-800">{selectError}</p>
          </div>
          <button
            onClick={() => setSelectError('')}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Slots remaining indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: maxSlots }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i < selectedRoommates.length ? 'bg-green-500' : 'bg-gray-200'
            }`}
          />
        ))}
        <span className="text-xs font-medium text-gray-500 ml-1 whitespace-nowrap">
          {selectedRoommates.length}/{maxSlots} selected
        </span>
      </div>

      {/* Search Input */}
      {slotsLeft > 0 && (
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search fellow {currentUserGender ? `${currentUserGender.toLowerCase()} ` : ''}students by name or register number
          </label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              placeholder={`Search ${currentUserGender ? `${currentUserGender.toLowerCase()} ` : ''}student to add as roommate${maxSlots > 1 ? ` (${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} left)` : ''}…`}
              className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
            {searching && (
              <svg className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          {/* Search results dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
              {results.map((student) => {
                const sGender = student.gender || 'Unknown';
                const sIsMale = sGender.toLowerCase() === 'male';
                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelect(student)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(student.firstName?.[0] || '?').toUpperCase()}{(student.lastName?.[0] || '').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          sIsMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {sGender}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {student.registerNumber} · {student.department}
                      </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600 flex-shrink-0">
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {showDropdown && !searching && results.length === 0 && query.length >= 2 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 text-sm text-gray-500">
              No matching {currentUserGender ? `${currentUserGender.toLowerCase()} ` : ''}students found for "{query}"
            </div>
          )}
        </div>
      )}

      {/* Selected Roommates */}
      {selectedRoommates.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-gray-700">Selected preferred roommate{selectedRoommates.length > 1 ? 's' : ''}</p>
          {selectedRoommates.map((student, idx) => {
            const sGender = student.gender || currentUserGender;
            const sIsMale = sGender?.toLowerCase() === 'male';
            return (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border border-green-200"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(student.firstName?.[0] || '?').toUpperCase()}{(student.lastName?.[0] || '').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <span className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      Roommate {idx + 1}
                    </span>
                    {sGender && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        sIsMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {sGender}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {student.registerNumber} · {student.department}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(student.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state / skip hint */}
      {selectedRoommates.length === 0 && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No preferred roommates selected</p>
          <p className="text-xs text-gray-400 mt-1">You can skip this step — the system will auto-match based on your lifestyle preferences.</p>
        </div>
      )}
    </div>
  );
}

function RadioOption({ label, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-100 text-left cursor-pointer
        ${selected ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center
        ${selected ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className={`text-sm font-medium ${selected ? 'text-green-800' : 'text-gray-700'}`}>{label}</span>
    </button>
  );
}

function SliderInput({ label, value, onChange }) {
  const labels = ['Very messy', 'Messy', 'Neutral', 'Clean', 'Very clean'];
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          {value} / 5 — {labels[value - 1]}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-green-600 cursor-pointer"
      />
      <div className="flex justify-between mt-1">
        {labels.map((l, i) => (
          <span key={i} className={`text-xs ${value === i + 1 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right ml-4">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentUserProfile, setCurrentUserProfile] = useState(user);
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState(initialPreferences);
  // selectedRoommates is an array of student DTOs (rich objects) for the search step
  const [selectedRoommates, setSelectedRoommates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // Room type availability from admin configuration
  const [availableRoomTypeConfigs, setAvailableRoomTypeConfigs] = useState([]);

  // Fetch room type availability config (runs once on mount)
  useEffect(() => {
    fetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_TYPE_CONFIG_AVAILABLE}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setAvailableRoomTypeConfigs(data))
      .catch(() => setAvailableRoomTypeConfigs([]));
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchPreferences();
      // Fetch complete student profile to guarantee gender is available
      apiFetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_BY_ID(user.id)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setCurrentUserProfile(data);
        })
        .catch(() => {});
    }
  }, [user]);


  const currentUserGender = currentUserProfile?.gender || user?.gender;

  const fetchPreferences = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.PREFERENCES_BY_STUDENT(user.id)}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setPreferences({
            ...initialPreferences,
            ...data,
            roomType: data.roomTypePreference1 || data.roomType || null,
            roomTypePreference1: data.roomTypePreference1 || data.roomType || null,
            roomTypePreference2: data.roomTypePreference2 || null,
            roomTypePreference3: data.roomTypePreference3 || null,
          });
          // If preferredRoommateIds exist, fetch the student details for display
          if (data.preferredRoommateIds && data.preferredRoommateIds.trim()) {
            const ids = data.preferredRoommateIds.split(',').map(id => id.trim()).filter(Boolean);
            const roommateDetails = await Promise.all(
              ids.map(id =>
                apiFetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_BY_ID(id)}`)
                  .then(r => r.ok ? r.json() : null)
                  .catch(() => null)
              )
            );
            setSelectedRoommates(roommateDetails.filter(Boolean));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const ALL_ROOM_TYPES = ['INDIVIDUAL', '2_SHARING', '3_SHARING', '4_SHARING'];
  const enabledConfigs = availableRoomTypeConfigs.filter(c => c.available);
  const availableSharingTypes = availableRoomTypeConfigs.length > 0
    ? ALL_ROOM_TYPES.filter(rt => enabledConfigs.some(c => c.roomType === rt))
    : ALL_ROOM_TYPES;

  const selectedTypeConfigs = availableRoomTypeConfigs.length > 0
    ? enabledConfigs.filter(c => c.roomType === (preferences.roomTypePreference1 || preferences.roomType))
    : [];

  const isAcAvailable = availableRoomTypeConfigs.length === 0 || selectedTypeConfigs.some(c => c.acType === 'AC');
  const isNonAcAvailable = availableRoomTypeConfigs.length === 0 || selectedTypeConfigs.some(c => c.acType === 'NON_AC');
  const isBothAllowed = isAcAvailable && isNonAcAvailable;

  // Auto-align roomType when availability configs load
  useEffect(() => {
    if (availableRoomTypeConfigs.length > 0 && availableSharingTypes.length > 0) {
      if (!preferences.roomType || !availableSharingTypes.includes(preferences.roomType)) {
        updatePreference('roomType', availableSharingTypes[0]);
        updatePreference('roomTypePreference1', availableSharingTypes[0]);
      }
    }
  }, [availableRoomTypeConfigs, availableSharingTypes, preferences.roomType]);

  // Auto-align acPreference when roomType or available configs change
  useEffect(() => {
    const activeType = preferences.roomTypePreference1 || preferences.roomType;
    if (availableRoomTypeConfigs.length > 0 && activeType) {
      const typeAcConfigs = enabledConfigs.filter(c => c.roomType === activeType);
      const acs = typeAcConfigs.map(c => c.acType);
      if (acs.length > 0) {
        if (!preferences.acPreference) {
          updatePreference('acPreference', acs.length > 1 ? 'BOTH' : acs[0]);
        } else if (preferences.acPreference === 'BOTH' && acs.length < 2) {
          updatePreference('acPreference', acs[0]);
        } else if (preferences.acPreference !== 'BOTH' && !acs.includes(preferences.acPreference)) {
          updatePreference('acPreference', acs[0]);
        }
      }
    }
  }, [preferences.roomType, preferences.roomTypePreference1, availableRoomTypeConfigs]);

  // When room type changes, clear selected roommates if over new limit
  const handleRoomTypeSelect = (type) => {
    updatePreference('roomType', type);
    updatePreference('roomTypePreference1', type);
    if (preferences.roomTypePreference2 === type) {
      updatePreference('roomTypePreference2', null);
    }
    if (preferences.roomTypePreference3 === type) {
      updatePreference('roomTypePreference3', null);
    }
    const newMax = type === 'INDIVIDUAL' ? 0
      : type === '2_SHARING' ? 1
      : type === '4_SHARING' ? 3
      : 2; // 3_SHARING
    if (selectedRoommates.length > newMax) {
      const trimmed = selectedRoommates.slice(0, newMax);
      setSelectedRoommates(trimmed);
      updatePreference('preferredRoommateIds', trimmed.map(r => r.id).join(','));
    }
    // Also adjust acPreference if not supported for newly selected room type
    if (availableRoomTypeConfigs.length > 0) {
      const typeAcConfigs = enabledConfigs.filter(c => c.roomType === type);
      const acs = typeAcConfigs.map(c => c.acType);
      if (acs.length > 0) {
        if (preferences.acPreference === 'BOTH' && acs.length < 2) {
          updatePreference('acPreference', acs[0]);
        } else if (preferences.acPreference && !acs.includes(preferences.acPreference) && preferences.acPreference !== 'BOTH') {
          updatePreference('acPreference', acs[0]);
        }
      }
    }
  };

  const handlePref2Select = (type) => {
    updatePreference('roomTypePreference2', type);
    if (preferences.roomTypePreference3 === type) {
      updatePreference('roomTypePreference3', null);
    }
  };

  const handlePref3Select = (type) => {
    updatePreference('roomTypePreference3', type);
  };

  const handleRoommatesUpdate = (roommates) => {
    setSelectedRoommates(roommates);
    // Sync to preferences as comma-separated IDs
    updatePreference('preferredRoommateIds', roommates.map(r => r.id).join(','));
  };

  const TOTAL_STEPS = 5;

  const canProceed = () => {
    if (currentStep === 1) return (preferences.roomType || preferences.roomTypePreference1) !== null && preferences.acPreference !== null;
    if (currentStep === 2) return true; // Optional step — always can proceed
    if (currentStep === 3) {
      return preferences.sleepTime !== null && 
             preferences.wakeUpTime !== null && 
             preferences.studyTiming !== null;
    }
    if (currentStep === 4) {
      return preferences.studyPreference !== null &&
             preferences.noisePreference !== null &&
             preferences.studyFrequency !== null &&
             preferences.studyEnvironment !== null &&
             preferences.socialPreference !== null &&
             preferences.personalSpace !== null &&
             preferences.visitorPreference !== null;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const studentId = Number(user?.id);
      if (!user?.id || isNaN(studentId) || (typeof user.id === 'string' && user.id.startsWith('user_'))) {
        setSubmitError('Student profile is still syncing with backend. Please refresh the page and try again.');
        setSubmitting(false);
        return;
      }

      const primaryRoomType = preferences.roomTypePreference1 || preferences.roomType;
      const payload = {
        ...preferences,
        studentId: studentId,
        roomType: primaryRoomType,
        roomTypePreference1: primaryRoomType,
        roomTypePreference2: preferences.roomTypePreference2 || null,
        roomTypePreference3: preferences.roomTypePreference3 || null,
        preferredRoommateIds: selectedRoommates.map(r => r.id).join(','),
        submitted: true,
      };
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PREFERENCES_SAVE(studentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        navigate('/student/dashboard');
      } else {
        const errorText = await response.text();
        setSubmitError(errorText || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSubmitError('Unable to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatValue = (key) => {
    const v = preferences[key];
    if (v === null || v === undefined) return '—';
    
    const formats = {
      roomType: { 'INDIVIDUAL': 'Individual (1 Bed)', '2_SHARING': '2-Sharing', '3_SHARING': '3-Sharing', '4_SHARING': '4-Sharing' },
      roomTypePreference1: { 'INDIVIDUAL': 'Individual (1 Bed)', '2_SHARING': '2-Sharing', '3_SHARING': '3-Sharing', '4_SHARING': '4-Sharing' },
      roomTypePreference2: { 'INDIVIDUAL': 'Individual (1 Bed)', '2_SHARING': '2-Sharing', '3_SHARING': '3-Sharing', '4_SHARING': '4-Sharing' },
      roomTypePreference3: { 'INDIVIDUAL': 'Individual (1 Bed)', '2_SHARING': '2-Sharing', '3_SHARING': '3-Sharing', '4_SHARING': '4-Sharing' },
      acPreference: { 'AC': 'AC Room', 'NON_AC': 'Non-AC Room', 'BOTH': 'Both (AC / Non-AC)' },
      sleepTime: { 'BEFORE_10': 'Before 10 PM', '10_TO_12': '10 PM – 12 AM', 'AFTER_12': 'After 12 AM' },
      wakeUpTime: { 'BEFORE_6': 'Before 6 AM', '6_TO_8': '6 AM – 8 AM', '8_TO_10': '8 AM – 10 AM', 'AFTER_10': 'After 10 AM' },
      studyTiming: {
        'MORNING_PERSON': 'Morning Person 🌅',
        'NIGHT_OWL': 'Night Owl 🌙',
        'FLEXIBLE': 'Flexible / Both ⚖️',
      },
      studyPreference: {
        'ALONE': 'Alone (Solo study)',
        'GROUP_STUDY': 'Group study',
        'DOESNT_MATTER': "Doesn't matter (Flexible)",
      },
      noisePreference: { 'VERY_QUIET': 'Very quiet', 'MODERATELY_QUIET': 'Moderately quiet', 'NO_PREFERENCE': 'No preference', 'COMFORTABLE_WITH_NOISE': 'Comfortable with noise' },
      studyFrequency: { 'FREQUENTLY': 'Frequently', 'SOMETIMES': 'Sometimes', 'RARELY': 'Rarely' },
      studyEnvironment: { 'COMPLETE_SILENCE': 'Complete silence', 'LOW_NOISE_OK': 'Low noise okay', 'NOISE_NO_ISSUE': 'Noise doesn\'t bother' },
      socialPreference: { 'PREFER_PRIVACY': 'Prefer privacy', 'BALANCED': 'Balanced', 'VERY_SOCIAL': 'Very social' },
      personalSpace: { 'NOT_VERY_IMPORTANT': 'Not very important', 'MODERATELY_IMPORTANT': 'Moderately important', 'VERY_IMPORTANT': 'Very important' },
      visitorPreference: { 'PREFER_NO_VISITORS': 'Prefer no visitors', 'OCCASIONAL_OK': 'Occasional visitors okay', 'VISITORS_FINE': 'Visitors are fine' },
    };
    
    if (key === 'cleanlinessLevel') return `${v} / 5`;
    return formats[key]?.[v] || v;
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">

        {/* Progress (Only shown when not yet submitted) */}
        {!preferences.submitted && (
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {preferences.submitted ? 'Room & Lifestyle Preferences' : steps[currentStep - 1].title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {preferences.submitted
              ? 'Your submitted preferences are finalized and locked for roommate matching.'
              : steps[currentStep - 1].subtitle}
          </p>
        </div>

        {/* Global Submit Error Banner */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 1 0 1.06 1.06L10 11.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L11.06 10l2.72-2.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900">Submission Error</h4>
              <p className="text-xs text-red-800 mt-0.5">{submitError}</p>
            </div>
            <button onClick={() => setSubmitError('')} className="text-red-400 hover:text-red-600 cursor-pointer text-sm">✕</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-10">
             <svg className="animate-spin w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
          </div>
        ) : preferences.submitted ? (
          <div className="space-y-6">
            {/* Locked Notice Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-900">Preferences Locked</h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-200/80 text-amber-900">
                    Cannot be edited
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Your hostel roommate preferences have been finalized and recorded in the system. According to hostel policy, once preferences are submitted, they cannot be modified. These parameters are used directly for roommate compatibility matching and room allocation.
                </p>
              </div>
            </div>

            {/* Read-Only Cards - Stacked Vertically */}
            <div className="space-y-6">
              {/* Room Sharing & AC Preference */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Room Preferences</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Selected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 font-bold text-lg flex items-center justify-center flex-shrink-0">
                      {preferences.roomType === 'INDIVIDUAL' ? '1' : preferences.roomType === '2_SHARING' ? '2' : preferences.roomType === '3_SHARING' ? '3' : preferences.roomType === '4_SHARING' ? '4' : '—'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sharing Capacity</p>
                      <h4 className="font-semibold text-gray-900 text-sm">{formatValue('roomType')} Room</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18 3.75 3.75M12 3 8.25 6.75M12 21l3.75-3.75M12 21l-3.75-3.75m-8.25-9h18m-18 0 3.75-3.75M3.75 12l3.75 3.75M21.75 12l-3.75-3.75M21.75 12l-3.75 3.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Climate Preference</p>
                      <h4 className="font-semibold text-gray-900 text-sm">{formatValue('acPreference')}</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Roommates */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Preferred Roommates</h3>
                  <span className="text-xs text-gray-400">
                    {selectedRoommates.length > 0 ? `${selectedRoommates.length} selected` : 'None'}
                  </span>
                </div>
                {selectedRoommates.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedRoommates.map((s, i) => {
                      const sGender = s.gender || currentUserGender;
                      const sIsMale = sGender?.toLowerCase() === 'male';
                      return (
                        <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50 border border-green-200">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(s.firstName?.[0] || '').toUpperCase()}{(s.lastName?.[0] || '').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                              {sGender && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  sIsMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                }`}>
                                  {sGender}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{s.registerNumber}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No preferred roommates specified</p>
                )}
              </div>

              {/* Sleep & Routine */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Sleep &amp; Daily Routine</h3>
                  <span className="text-xs text-gray-400">Schedule</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Sleep Time</span>
                    <span className="font-medium text-gray-800">{formatValue('sleepTime')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Wake Up Time</span>
                    <span className="font-medium text-gray-800">{formatValue('wakeUpTime')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Study Timing</span>
                    <span className="font-medium text-gray-800">{formatValue('studyTiming')}</span>
                  </div>
                </div>
              </div>

              {/* Living & Study Habits */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Living Environment &amp; Cleanliness</h3>
                  <span className="text-xs text-gray-400">Environment</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Cleanliness Level</span>
                    <span className="font-medium text-gray-800">{formatValue('cleanlinessLevel')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Noise Preference</span>
                    <span className="font-medium text-gray-800">{formatValue('noisePreference')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Study Style</span>
                    <span className="font-medium text-gray-800">{formatValue('studyPreference')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Study Frequency</span>
                    <span className="font-medium text-gray-800">{formatValue('studyFrequency')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Study Environment</span>
                    <span className="font-medium text-gray-800">{formatValue('studyEnvironment')}</span>
                  </div>
                </div>
              </div>

              {/* Social & Roommate Dynamics */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Social &amp; Roommate Dynamics</h3>
                  <span className="text-xs text-gray-400">Compatibility</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Social Preference</span>
                    <span className="font-medium text-gray-800">{formatValue('socialPreference')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Personal Space</span>
                    <span className="font-medium text-gray-800">{formatValue('personalSpace')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Room Visitors</span>
                    <span className="font-medium text-gray-800">{formatValue('visitorPreference')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Dashboard action */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                ← Back to Dashboard
              </button>
              <span className="text-xs text-gray-400">Locked on submission • Contact hostel administration for support</span>
            </div>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">

          {/* Step 1: Room Preferences (Sharing & AC) */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Question 1: Sharing Type (1st Preference) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      1. Preferred Sharing Type (1st Choice)
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">Your primary room category preference</p>
                  </div>
                  <span className="text-xs text-gray-400">Required</span>
                </div>
                {availableSharingTypes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableSharingTypes.map(type => (
                      <RoomTypeCard
                        key={type}
                        type={type}
                        selected={preferences.roomTypePreference1 || preferences.roomType}
                        onSelect={handleRoomTypeSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    No room types are currently open for allocation. Please check back later or contact administration.
                  </div>
                )}
              </div>

              {/* Question 2: Fallback Sharing Preferences (Strategy 2 Priority Queue) */}
              {availableSharingTypes.length > 1 && (
                <div className="border-t border-gray-100 pt-6">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900">
                        2. Fallback Sharing Preferences
                      </label>
                      <span className="text-xs text-gray-400">Optional Fallbacks</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      If rooms in your 1st choice are filled by earlier applicants, the allocation algorithm will automatically place you into your 2nd or 3rd preference in order.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 2nd Preference */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          2nd Preference 
                        </span>
                        {preferences.roomTypePreference2 && (
                          <button
                            type="button"
                            onClick={() => handlePref2Select(null)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSharingTypes
                          .filter(t => t !== (preferences.roomTypePreference1 || preferences.roomType))
                          .map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handlePref2Select(type)}
                              className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                                preferences.roomTypePreference2 === type
                                  ? 'border-green-600 bg-green-50 text-green-800 font-semibold shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                              }`}
                            >
                              {type === 'INDIVIDUAL' ? 'Individual' : type.replace('_', '-')}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* 3rd Preference */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          3rd Preference 
                        </span>
                        {preferences.roomTypePreference3 && (
                          <button
                            type="button"
                            onClick={() => handlePref3Select(null)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSharingTypes
                          .filter(t => t !== (preferences.roomTypePreference1 || preferences.roomType) && t !== preferences.roomTypePreference2)
                          .map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handlePref3Select(type)}
                              className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                                preferences.roomTypePreference3 === type
                                  ? 'border-green-600 bg-green-50 text-green-800 font-semibold shadow-xs'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                              }`}
                            >
                              {type === 'INDIVIDUAL' ? 'Individual' : type.replace('_', '-')}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Question 3: AC Preference */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    3. Air Conditioning (AC) Preference
                  </label>
                  <span className="text-xs text-gray-400">Required</span>
                </div>
                {(!isAcAvailable && !isNonAcAvailable) ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    No AC options are currently open for this room type.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {isAcAvailable && (
                      <AcOptionCard
                        type="AC"
                        title="AC Room"
                        description="Air-conditioned room for cooler temperature control"
                        selected={preferences.acPreference === 'AC'}
                        onSelect={() => updatePreference('acPreference', 'AC')}
                      />
                    )}
                    {isNonAcAvailable && (
                      <AcOptionCard
                        type="NON_AC"
                        title="Non-AC Room"
                        description="Standard well-ventilated room with ceiling fans"
                        selected={preferences.acPreference === 'NON_AC'}
                        onSelect={() => updatePreference('acPreference', 'NON_AC')}
                      />
                    )}
                    {isBothAllowed && (
                      <AcOptionCard
                        type="BOTH"
                        title="Both (No Preference)"
                        description="Comfortable with either AC or Non-AC room depending on availability"
                        selected={preferences.acPreference === 'BOTH'}
                        onSelect={() => updatePreference('acPreference', 'BOTH')}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Preferred Roommates */}
          {currentStep === 2 && (
            <RoommateSearchStep
              roomType={preferences.roomType}
              selectedRoommates={selectedRoommates}
              onUpdateRoommates={handleRoommatesUpdate}
              currentUserId={user?.id}
              currentUserGender={currentUserGender}
            />
          )}

          {/* Step 3: Sleep & Routine */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What time do you usually sleep?</label>
                <div className="space-y-2">
                  <RadioOption label="Before 10 PM" selected={preferences.sleepTime === 'BEFORE_10'} onSelect={() => updatePreference('sleepTime', 'BEFORE_10')} />
                  <RadioOption label="10 PM – 12 AM" selected={preferences.sleepTime === '10_TO_12'} onSelect={() => updatePreference('sleepTime', '10_TO_12')} />
                  <RadioOption label="After 12 AM" selected={preferences.sleepTime === 'AFTER_12'} onSelect={() => updatePreference('sleepTime', 'AFTER_12')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What time do you usually wake up?</label>
                <div className="space-y-2">
                  <RadioOption label="Before 6 AM" selected={preferences.wakeUpTime === 'BEFORE_6'} onSelect={() => updatePreference('wakeUpTime', 'BEFORE_6')} />
                  <RadioOption label="6 AM – 8 AM" selected={preferences.wakeUpTime === '6_TO_8'} onSelect={() => updatePreference('wakeUpTime', '6_TO_8')} />
                  <RadioOption label="8 AM – 10 AM" selected={preferences.wakeUpTime === '8_TO_10'} onSelect={() => updatePreference('wakeUpTime', '8_TO_10')} />
                  <RadioOption label="After 10 AM" selected={preferences.wakeUpTime === 'AFTER_10'} onSelect={() => updatePreference('wakeUpTime', 'AFTER_10')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Study Timing &amp; Chronotype: Are you a Morning Person or a Night Owl?
                  </label>
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">Important</span>
                </div>
                <div className="space-y-2">
                  <RadioOption
                    label="Morning Person (Early bird — most active, alert & productive in morning hours)"
                    selected={preferences.studyTiming === 'MORNING_PERSON'}
                    onSelect={() => updatePreference('studyTiming', 'MORNING_PERSON')}
                  />
                  <RadioOption
                    label="Night Owl (Late night — most active, alert & productive late at night)"
                    selected={preferences.studyTiming === 'NIGHT_OWL'}
                    onSelect={() => updatePreference('studyTiming', 'NIGHT_OWL')}
                  />
                  <RadioOption
                    label="Flexible / Both (Adaptable schedule depending on coursework and classes)"
                    selected={preferences.studyTiming === 'FLEXIBLE'}
                    onSelect={() => updatePreference('studyTiming', 'FLEXIBLE')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Lifestyle */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Study Preference: How do you prefer to study?
                  </label>
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">Important</span>
                </div>
                <div className="space-y-2">
                  <RadioOption
                    label="Alone (Individual study in quiet, focused space)"
                    selected={preferences.studyPreference === 'ALONE'}
                    onSelect={() => updatePreference('studyPreference', 'ALONE')}
                  />
                  <RadioOption
                    label="Group study (Collaborative studying & discussing with roommates or peers)"
                    selected={preferences.studyPreference === 'GROUP_STUDY'}
                    onSelect={() => updatePreference('studyPreference', 'GROUP_STUDY')}
                  />
                  <RadioOption
                    label="Doesn't matter (Comfortable studying either alone or in a group)"
                    selected={preferences.studyPreference === 'DOESNT_MATTER'}
                    onSelect={() => updatePreference('studyPreference', 'DOESNT_MATTER')}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What kind of room environment do you prefer?</label>
                <div className="space-y-2">
                  <RadioOption label="Very quiet" selected={preferences.noisePreference === 'VERY_QUIET'} onSelect={() => updatePreference('noisePreference', 'VERY_QUIET')} />
                  <RadioOption label="Moderately quiet" selected={preferences.noisePreference === 'MODERATELY_QUIET'} onSelect={() => updatePreference('noisePreference', 'MODERATELY_QUIET')} />
                  <RadioOption label="No preference" selected={preferences.noisePreference === 'NO_PREFERENCE'} onSelect={() => updatePreference('noisePreference', 'NO_PREFERENCE')} />
                  <RadioOption label="Comfortable with noise" selected={preferences.noisePreference === 'COMFORTABLE_WITH_NOISE'} onSelect={() => updatePreference('noisePreference', 'COMFORTABLE_WITH_NOISE')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <SliderInput
                  label="How important is cleanliness to you?"
                  value={preferences.cleanlinessLevel}
                  onChange={(val) => updatePreference('cleanlinessLevel', val)}
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How often do you study in your room?</label>
                <div className="space-y-2">
                  <RadioOption label="Frequently" selected={preferences.studyFrequency === 'FREQUENTLY'} onSelect={() => updatePreference('studyFrequency', 'FREQUENTLY')} />
                  <RadioOption label="Sometimes" selected={preferences.studyFrequency === 'SOMETIMES'} onSelect={() => updatePreference('studyFrequency', 'SOMETIMES')} />
                  <RadioOption label="Rarely" selected={preferences.studyFrequency === 'RARELY'} onSelect={() => updatePreference('studyFrequency', 'RARELY')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What environment do you prefer while studying?</label>
                <div className="space-y-2">
                  <RadioOption label="Complete silence" selected={preferences.studyEnvironment === 'COMPLETE_SILENCE'} onSelect={() => updatePreference('studyEnvironment', 'COMPLETE_SILENCE')} />
                  <RadioOption label="Low noise is okay" selected={preferences.studyEnvironment === 'LOW_NOISE_OK'} onSelect={() => updatePreference('studyEnvironment', 'LOW_NOISE_OK')} />
                  <RadioOption label="Noise doesn't bother me" selected={preferences.studyEnvironment === 'NOISE_NO_ISSUE'} onSelect={() => updatePreference('studyEnvironment', 'NOISE_NO_ISSUE')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">What kind of roommate environment do you prefer?</label>
                <div className="space-y-2">
                  <RadioOption label="Prefer privacy" selected={preferences.socialPreference === 'PREFER_PRIVACY'} onSelect={() => updatePreference('socialPreference', 'PREFER_PRIVACY')} />
                  <RadioOption label="Balanced" selected={preferences.socialPreference === 'BALANCED'} onSelect={() => updatePreference('socialPreference', 'BALANCED')} />
                  <RadioOption label="Very social" selected={preferences.socialPreference === 'VERY_SOCIAL'} onSelect={() => updatePreference('socialPreference', 'VERY_SOCIAL')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How important is personal space to you?</label>
                <div className="space-y-2">
                  <RadioOption label="Not very important" selected={preferences.personalSpace === 'NOT_VERY_IMPORTANT'} onSelect={() => updatePreference('personalSpace', 'NOT_VERY_IMPORTANT')} />
                  <RadioOption label="Moderately important" selected={preferences.personalSpace === 'MODERATELY_IMPORTANT'} onSelect={() => updatePreference('personalSpace', 'MODERATELY_IMPORTANT')} />
                  <RadioOption label="Very important" selected={preferences.personalSpace === 'VERY_IMPORTANT'} onSelect={() => updatePreference('personalSpace', 'VERY_IMPORTANT')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How comfortable are you with roommates having visitors?</label>
                <div className="space-y-2">
                  <RadioOption label="Prefer no visitors" selected={preferences.visitorPreference === 'PREFER_NO_VISITORS'} onSelect={() => updatePreference('visitorPreference', 'PREFER_NO_VISITORS')} />
                  <RadioOption label="Occasional visitors are okay" selected={preferences.visitorPreference === 'OCCASIONAL_OK'} onSelect={() => updatePreference('visitorPreference', 'OCCASIONAL_OK')} />
                  <RadioOption label="Visitors are fine" selected={preferences.visitorPreference === 'VISITORS_FINE'} onSelect={() => updatePreference('visitorPreference', 'VISITORS_FINE')} />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-4 text-xs text-amber-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-amber-600">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                <span><strong>Important Notice:</strong> Once submitted, your preferences cannot be edited or modified. Please review all selections carefully before submitting.</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 mb-4">
                <ReviewItem label="1st Choice Room Type" value={formatValue('roomTypePreference1') !== '—' ? formatValue('roomTypePreference1') : formatValue('roomType')} />
                {preferences.roomTypePreference2 && (
                  <ReviewItem label="2nd Choice (Fallback)" value={formatValue('roomTypePreference2')} />
                )}
                {preferences.roomTypePreference3 && (
                  <ReviewItem label="3rd Choice (Fallback)" value={formatValue('roomTypePreference3')} />
                )}
                <ReviewItem label="AC Preference" value={formatValue('acPreference')} />
                <ReviewItem
                  label="Preferred Roommates"
                  value={
                    selectedRoommates.length > 0
                      ? selectedRoommates.map(r => `${r.firstName} ${r.lastName}${r.gender ? ` (${r.gender})` : ''}`).join(', ')
                      : 'None (auto-match by system)'
                  }
                />
                <ReviewItem label="Sleep Time" value={formatValue('sleepTime')} />
                <ReviewItem label="Wake Up Time" value={formatValue('wakeUpTime')} />
                <ReviewItem label="Study Timing" value={formatValue('studyTiming')} />
                <ReviewItem label="Study Preference" value={formatValue('studyPreference')} />
                <ReviewItem label="Noise Preference" value={formatValue('noisePreference')} />
                <ReviewItem label="Cleanliness Level" value={formatValue('cleanlinessLevel')} />
                <ReviewItem label="Study Frequency" value={formatValue('studyFrequency')} />
                <ReviewItem label="Study Environment" value={formatValue('studyEnvironment')} />
                <ReviewItem label="Social Preference" value={formatValue('socialPreference')} />
                <ReviewItem label="Personal Space" value={formatValue('personalSpace')} />
                <ReviewItem label="Visitor Preference" value={formatValue('visitorPreference')} />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Please review your preferences carefully.
              </p>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700
                hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ← Back
            </button>
          )}

          {/* Skip button only on step 2 (optional step) */}
          {currentStep === 2 && selectedRoommates.length === 0 && (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500
                hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Skip (no preference)
            </button>
          )}

          <div className="flex-1" />

          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: canProceed() ? 'linear-gradient(135deg, #2d5016, #4a7c2c)' : '#9ca3af' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer
                disabled:opacity-60 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Preferences'
              )}
            </button>
          )}
        </div>
          </>
        )}

      </div>
    </StudentLayout>
  );
}
