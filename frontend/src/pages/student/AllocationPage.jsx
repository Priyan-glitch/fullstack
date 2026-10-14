import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { ALLOCATION_API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import StudentLayout from '../../layouts/StudentLayout';

// Simple icon components as replacements
const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserGroupIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AllocationPage() {
  const { user } = useUser();
  const [allocationStatus, setAllocationStatus] = useState('not_allocated');
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAllocation = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLOCATION_API_BASE_URL}${API_ENDPOINTS.ALLOCATION_BY_STUDENT(user.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.allocationStatus === 'allocated' && data.room) {
            setAllocationStatus('allocated');
            setAllocationData({
              roomNumber: data.room.roomNumber,
              roomType: data.room.roomType || '2-Sharing',
              building: data.room.hostelName || data.room.block || 'Main Block',
              floor: data.room.floor || '1st Floor',
              roommates: data.roommates || [],
            });
          } else {
            setAllocationStatus('not_allocated');
          }
        } else {
          setAllocationStatus('not_allocated');
        }
      } catch (err) {
        console.error('Failed to fetch allocation:', err);
        setAllocationStatus('not_allocated');
      } finally {
        setLoading(false);
      }
    };
    fetchAllocation();
  }, [user?.id]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const renderNotAllocated = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <InformationCircleIcon className="w-7 h-7 text-gray-400" />
      </div>
      
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Allocation Status
      </h2>
      
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm font-medium mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Not Yet Allocated
      </div>
      
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        The administrator has not published the room allocation yet.
      </p>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-md mx-auto mb-6">
        <p className="text-sm text-gray-700">
          You will be notified via email once the room allocation is published. 
          Please ensure your preferences are up to date.
        </p>
      </div>
      
      <Link
        to="/student/preferences"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
      >
        Review My Preferences
      </Link>
    </div>
  );

  const renderInProgress = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
      <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <ClockIcon className="w-7 h-7 text-amber-500" />
      </div>
      
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Allocation Status
      </h2>
      
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Allocation in Progress
      </div>
      
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        The allocation algorithm is currently running. Your room assignment will be available shortly.
      </p>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3 text-left">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            This process typically takes a few minutes. You will receive an email notification 
            once your room has been assigned.
          </p>
        </div>
      </div>
    </div>
  );

  const renderAllocated = () => (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className="bg-white rounded-xl border border-emerald-100 p-5">
        <div className="flex items-center gap-3 mb-1">
          <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Allocation Status</h2>
        </div>
        <div className="flex items-center gap-2 ml-9">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Allocated
          </span>
        </div>
      </div>

      {/* Room Information */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-gray-500" />
            Room Details
          </h3>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Room Number</p>
              <p className="text-2xl font-bold text-gray-900">{allocationData.roomNumber}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-1">Room Type</p>
              <p className="text-base font-semibold text-gray-700">{allocationData.roomType}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-1">Building</p>
              <p className="text-base font-semibold text-gray-700">{allocationData.building}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-1">Floor</p>
              <p className="text-base font-semibold text-gray-700">{allocationData.floor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roommates Information */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-gray-500" />
            Your Roommates
          </h3>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocationData.roommates.map((roommate) => (
              <div 
                key={roommate.id}
                className="border border-gray-100 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                    {getInitials(roommate.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">
                      {roommate.name}
                    </h4>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20">Department:</span>
                        <span className="text-xs font-medium text-gray-700">{roommate.department}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20">Year:</span>
                        <span className="text-xs font-medium text-gray-700">{roommate.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {allocationData.roommates.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>No roommates assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Important:</strong> Please report to the hostel office with your admission documents 
              and ID proof to collect your room keys.
            </p>
            <p>
              If you have any concerns about your allocation, you may submit a room change request 
              after the initial settling period (usually 2 weeks).
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Room Allocation</h1>
          <p className="text-sm text-gray-400 mt-0.5">View your room assignment and roommate details</p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {allocationStatus === 'not_allocated' && renderNotAllocated()}
          {allocationStatus === 'in_progress' && renderInProgress()}
          {allocationStatus === 'allocated' && renderAllocated()}
        </div>
      </div>
    </StudentLayout>
  );
}
