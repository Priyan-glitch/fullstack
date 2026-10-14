import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { HOSTEL_API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { apiFetch } from '../../lib/http';

// Simple icon components
const BuildingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const computeRoomStats = (roomsList) => {
  let individual = 0;
  let twoSharing = 0;
  let threeSharing = 0;
  let fourSharing = 0;
  let ac = 0;
  let nonAc = 0;

  (roomsList || []).forEach(r => {
    const rt = (r.roomType || '').toUpperCase().replace('-', '_');
    const cap = r.capacity;
    if (rt.includes('1') || rt.includes('INDIVIDUAL') || rt.includes('SINGLE') || cap === 1) {
      individual++;
    } else if (rt.includes('2') || cap === 2) {
      twoSharing++;
    } else if (rt.includes('3') || cap === 3) {
      threeSharing++;
    } else if (rt.includes('4') || cap === 4) {
      fourSharing++;
    }

    const isAc = /\b(AC|A\/C|AIR[\s-]CONDITION(ING|ER)?)\b/i.test(r.amenities || '');
    if (isAc) {
      ac++;
    } else {
      nonAc++;
    }
  });

  return {
    total: roomsList.length,
    individual,
    twoSharing,
    threeSharing,
    fourSharing,
    ac,
    nonAc,
  };
};

function RoomBreakdownSection({ stats, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg className="animate-spin w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading room breakdown...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-gray-50/80 border border-gray-200/90 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <span></span> Room Inventory Breakdown
        </h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200">
          {stats.total} Total Registered {stats.total === 1 ? 'Room' : 'Rooms'}
        </span>
      </div>

      {/* Sharing Types Grid */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Sharing Capacity</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] text-gray-800 font-semibold block">Individual</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{stats.individual}</span>
            <span className="text-[10px] text-gray-400">1-bed rooms</span>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] text-gray-800 font-semibold block">2-Sharing</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{stats.twoSharing}</span>
            <span className="text-[10px] text-gray-400">2-bed rooms</span>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] text-gray-800 font-semibold block">3-Sharing</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{stats.threeSharing}</span>
            <span className="text-[10px] text-gray-400">3-bed rooms</span>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] text-gray-800 font-semibold block">4-Sharing</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{stats.fourSharing}</span>
            <span className="text-[10px] text-gray-400">4-bed rooms</span>
          </div>
        </div>
      </div>

      {/* AC / Non-AC Grid */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Cooling Facility</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-lg p-2.5 border border-gray-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-800">AC Rooms</p>
                <p className="text-[10px] text-gray-400">Air Conditioned</p>
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.ac}</span>
          </div>

          <div className="bg-white rounded-lg p-2.5 border border-gray-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-800">Non-AC Rooms</p>
                <p className="text-[10px] text-gray-400">Standard ventilation</p>
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.nonAc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableRoomInventory({ formData, onChange, onAutoBalanceNonAc }) {
  const indiv = parseInt(formData.individualRooms, 10) || 0;
  const two = parseInt(formData.twoSharingRooms, 10) || 0;
  const three = parseInt(formData.threeSharingRooms, 10) || 0;
  const four = parseInt(formData.fourSharingRooms, 10) || 0;
  const ac = parseInt(formData.acRooms, 10) || 0;
  const nonAc = parseInt(formData.nonAcRooms, 10) || 0;

  const computedRooms = indiv + two + three + four;
  const computedCapacity = (indiv * 1) + (two * 2) + (three * 3) + (four * 4);
  const coolingTotal = ac + nonAc;
  const isCoolingConsistent = coolingTotal === computedRooms;

  const inputCls = "w-full px-2.5 py-1.5 text-base font-bold text-gray-900 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400";

  return (
    <div className="bg-gray-50/90 border border-gray-200/90 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <div>
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Room Inventory Breakdown
          </h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Set room counts by type. Total rooms and capacity auto-update.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-800 border border-gray-300">
            {computedRooms} {computedRooms === 1 ? 'Room' : 'Rooms'}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-800 border border-gray-300">
            {computedCapacity} {computedCapacity === 1 ? 'Bed' : 'Beds'}
          </span>
        </div>
      </div>

      {/* Sharing Types Grid */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Sharing Capacity (Room Count)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Individual */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Individual</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">1 bed</span>
            </div>
            <input
              type="number"
              min="0"
              value={formData.individualRooms === 0 ? '0' : (formData.individualRooms || '')}
              onChange={(e) => onChange('individualRooms', e.target.value)}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400">= {indiv} bed capacity</p>
          </div>

          {/* 2-Sharing */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">2-Sharing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">2 beds</span>
            </div>
            <input
              type="number"
              min="0"
              value={formData.twoSharingRooms === 0 ? '0' : (formData.twoSharingRooms || '')}
              onChange={(e) => onChange('twoSharingRooms', e.target.value)}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400">= {two * 2} beds capacity</p>
          </div>

          {/* 3-Sharing */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">3-Sharing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">3 beds</span>
            </div>
            <input
              type="number"
              min="0"
              value={formData.threeSharingRooms === 0 ? '0' : (formData.threeSharingRooms || '')}
              onChange={(e) => onChange('threeSharingRooms', e.target.value)}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400">= {three * 3} beds capacity</p>
          </div>

          {/* 4-Sharing */}
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">4-Sharing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">4 beds</span>
            </div>
            <input
              type="number"
              min="0"
              value={formData.fourSharingRooms === 0 ? '0' : (formData.fourSharingRooms || '')}
              onChange={(e) => onChange('fourSharingRooms', e.target.value)}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400">= {four * 4} beds capacity</p>
          </div>
        </div>
      </div>

      {/* Cooling Facility Grid */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Cooling Facility Split</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">AC Rooms</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">Air Conditioned</span>
            </div>
            <input
              type="number"
              min="0"
              value={formData.acRooms === 0 ? '0' : (formData.acRooms || '')}
              onChange={(e) => onChange('acRooms', e.target.value)}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400">Rooms with air conditioning</p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Non-AC Rooms</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">Standard</span>
            </div>
            <input
              type="number"
              min="0"
              value={formData.nonAcRooms === 0 ? '0' : (formData.nonAcRooms || '')}
              onChange={(e) => onChange('nonAcRooms', e.target.value)}
              className={inputCls}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400">Standard ventilated rooms</p>
          </div>
        </div>

        {/* Consistency Status Callout */}
        <div className="mt-2.5">
          {isCoolingConsistent ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Consistent: {ac} AC + {nonAc} Non-AC = {computedRooms} Total Rooms</span>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-medium text-gray-800 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Cooling mismatch: AC ({ac}) + Non-AC ({nonAc}) = {coolingTotal}, but total rooms is {computedRooms}.</span>
              </div>
              <button
                type="button"
                onClick={onAutoBalanceNonAc}
                className="px-2.5 py-1 text-[11px] font-semibold text-gray-800 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Auto-balance Non-AC to {Math.max(0, computedRooms - ac)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function HostelsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [viewingHostel, setViewingHostel] = useState(null);
  const [hostelRoomStats, setHostelRoomStats] = useState(null);
  const [loadingRoomStats, setLoadingRoomStats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.HOSTELS}`);
      if (!response.ok) throw new Error('Failed to fetch hostels');
      const data = await response.json();
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const fetchHostelRoomStats = async (hostelId) => {
    try {
      setLoadingRoomStats(true);
      setHostelRoomStats(null);
      const res = await fetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOMS_BY_HOSTEL(hostelId)}`);
      if (res.ok) {
        const roomsList = await res.json();
        const stats = computeRoomStats(roomsList);
        setHostelRoomStats(stats);
        return stats;
      }
    } catch (err) {
      console.error('Error fetching hostel rooms:', err);
    } finally {
      setLoadingRoomStats(false);
    }
    return null;
  };

  const defaultFormData = {
    name: '',
    address: '',
    totalCapacity: '',
    totalRooms: '',
    genderType: 'MALE',
    wardenName: '',
    wardenPhone: '',
    amenities: '',
    individualRooms: 0,
    twoSharingRooms: 0,
    threeSharingRooms: 0,
    fourSharingRooms: 0,
    acRooms: 0,
    nonAcRooms: 0,
    autoSync: true,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const handleAdd = () => {
    setEditingHostel(null);
    setHostelRoomStats(null);
    setFormData({ ...defaultFormData });
    setShowModal(true);
  };

  const handleView = (hostel) => {
    setViewingHostel(hostel);
    fetchHostelRoomStats(hostel.id);
  };

  const handleEdit = async (hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      address: hostel.address || '',
      totalCapacity: hostel.totalCapacity,
      totalRooms: hostel.totalRooms || '',
      genderType: hostel.genderType,
      wardenName: hostel.wardenName || '',
      wardenPhone: hostel.wardenPhone || '',
      amenities: hostel.amenities || '',
      individualRooms: 0,
      twoSharingRooms: 0,
      threeSharingRooms: 0,
      fourSharingRooms: 0,
      acRooms: 0,
      nonAcRooms: 0,
      autoSync: true,
    });
    setShowModal(true);

    const stats = await fetchHostelRoomStats(hostel.id);
    if (stats && stats.total > 0) {
      const computedRooms = stats.individual + stats.twoSharing + stats.threeSharing + stats.fourSharing;
      const computedCap = (stats.individual * 1) + (stats.twoSharing * 2) + (stats.threeSharing * 3) + (stats.fourSharing * 4);
      setFormData(prev => ({
        ...prev,
        individualRooms: stats.individual,
        twoSharingRooms: stats.twoSharing,
        threeSharingRooms: stats.threeSharing,
        fourSharingRooms: stats.fourSharing,
        acRooms: stats.ac,
        nonAcRooms: stats.nonAc,
        totalRooms: computedRooms || hostel.totalRooms || 0,
        totalCapacity: computedCap || hostel.totalCapacity || 0,
      }));
    } else if (hostel.totalRooms > 0) {
      setFormData(prev => ({
        ...prev,
        nonAcRooms: prev.nonAcRooms || hostel.totalRooms || 0,
      }));
    }
  };

  const handleInventoryChange = (field, rawValue) => {
    const num = Math.max(0, parseInt(rawValue, 10) || 0);
    setFormData(prev => {
      const next = { ...prev, [field]: num };
      
      const indiv = field === 'individualRooms' ? num : (parseInt(next.individualRooms, 10) || 0);
      const two = field === 'twoSharingRooms' ? num : (parseInt(next.twoSharingRooms, 10) || 0);
      const three = field === 'threeSharingRooms' ? num : (parseInt(next.threeSharingRooms, 10) || 0);
      const four = field === 'fourSharingRooms' ? num : (parseInt(next.fourSharingRooms, 10) || 0);
      
      const computedRooms = indiv + two + three + four;
      const computedCap = (indiv * 1) + (two * 2) + (three * 3) + (four * 4);

      if (prev.autoSync !== false) {
        next.totalRooms = computedRooms;
        next.totalCapacity = computedCap;
      }

      // If user changed sharing room types, auto-adapt nonAc so ac + nonAc === computedRooms
      if (['individualRooms', 'twoSharingRooms', 'threeSharingRooms', 'fourSharingRooms'].includes(field)) {
        const currentAc = parseInt(next.acRooms, 10) || 0;
        if (currentAc <= computedRooms) {
          next.nonAcRooms = computedRooms - currentAc;
        } else {
          next.acRooms = computedRooms;
          next.nonAcRooms = 0;
        }
      } else if (field === 'acRooms') {
        const total = prev.autoSync !== false ? computedRooms : (parseInt(next.totalRooms, 10) || computedRooms);
        next.nonAcRooms = Math.max(0, total - num);
      }

      return next;
    });
  };

  const handleAutoBalanceNonAc = () => {
    setFormData(prev => {
      const indiv = parseInt(prev.individualRooms, 10) || 0;
      const two = parseInt(prev.twoSharingRooms, 10) || 0;
      const three = parseInt(prev.threeSharingRooms, 10) || 0;
      const four = parseInt(prev.fourSharingRooms, 10) || 0;
      const computedRooms = indiv + two + three + four;
      const ac = parseInt(prev.acRooms, 10) || 0;
      return {
        ...prev,
        nonAcRooms: Math.max(0, computedRooms - ac),
      };
    });
  };

  const handleSyncTotals = () => {
    setFormData(prev => {
      const indiv = parseInt(prev.individualRooms, 10) || 0;
      const two = parseInt(prev.twoSharingRooms, 10) || 0;
      const three = parseInt(prev.threeSharingRooms, 10) || 0;
      const four = parseInt(prev.fourSharingRooms, 10) || 0;
      const computedRooms = indiv + two + three + four;
      const computedCap = (indiv * 1) + (two * 2) + (three * 3) + (four * 4);
      return {
        ...prev,
        totalRooms: computedRooms,
        totalCapacity: computedCap,
        autoSync: true,
      };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) return;
    
    try {
      const response = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.HOSTEL_BY_ID(id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete hostel');
      await fetchHostels();
    } catch (err) {
      console.error('Error deleting hostel:', err);
      alert('Failed to delete hostel');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const indiv = parseInt(formData.individualRooms, 10) || 0;
      const two = parseInt(formData.twoSharingRooms, 10) || 0;
      const three = parseInt(formData.threeSharingRooms, 10) || 0;
      const four = parseInt(formData.fourSharingRooms, 10) || 0;
      const computedRooms = indiv + two + three + four;
      const computedCap = (indiv * 1) + (two * 2) + (three * 3) + (four * 4);

      const finalTotalRooms = (formData.autoSync !== false && computedRooms > 0)
        ? computedRooms
        : (parseInt(formData.totalRooms, 10) || computedRooms);

      const finalTotalCapacity = (formData.autoSync !== false && computedCap > 0)
        ? computedCap
        : (parseInt(formData.totalCapacity, 10) || computedCap);

      const hostelData = {
        name: formData.name,
        address: formData.address,
        genderType: formData.genderType,
        wardenName: formData.wardenName,
        wardenPhone: formData.wardenPhone,
        amenities: formData.amenities,
        totalCapacity: finalTotalCapacity,
        totalRooms: finalTotalRooms,
        availableCapacity: editingHostel 
          ? Math.min(editingHostel.availableCapacity, finalTotalCapacity)
          : finalTotalCapacity,
        active: true,
      };

      const url = editingHostel 
        ? `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.HOSTEL_BY_ID(editingHostel.id)}`
        : `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.HOSTELS}`;
      
      const method = editingHostel ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostelData),
      });

      if (!response.ok) throw new Error('Failed to save hostel');
      const savedHostel = await response.json();
      const targetHostelId = editingHostel ? editingHostel.id : savedHostel.id;

      // Sync room inventory in the backend rooms table
      if (targetHostelId && computedRooms > 0) {
        try {
          await fetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOMS_SYNC_INVENTORY(targetHostelId)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              individualRooms: indiv,
              twoSharingRooms: two,
              threeSharingRooms: three,
              fourSharingRooms: four,
              acRooms: parseInt(formData.acRooms, 10) || 0,
              nonAcRooms: parseInt(formData.nonAcRooms, 10) || 0,
            }),
          });
        } catch (syncErr) {
          console.warn('Could not sync room records to database:', syncErr);
        }
      }

      await fetchHostels();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving hostel:', err);
      alert('Failed to save hostel: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getOccupancyPercentage = (occupied, capacity) => {
    return Math.round((occupied / capacity) * 100);
  };

  const getOccupancyColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage hostel buildings and capacity</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
          >
            <PlusIcon className="w-4 h-4" />
            Add Hostel
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BuildingIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Hostels</p>
                <p className="text-2xl font-bold text-gray-900">{hostels.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hostels.reduce((sum, h) => sum + (h.totalCapacity || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Available Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hostels.reduce((sum, h) => sum + (h.availableCapacity || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hostels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500">Loading hostels...</p>
            </div>
          )}
          
          {error && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && hostels.map((hostel) => {
            const occupancyPercentage = hostel.totalCapacity > 0 
              ? Math.round(((hostel.totalCapacity - hostel.availableCapacity) / hostel.totalCapacity) * 100)
              : 0;

            return (
              <div key={hostel.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{hostel.name}</h3>
                      <p className="text-sm text-white/80 mt-0.5">
                        {hostel.genderType} • {hostel.address || 'No address'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(hostel)}
                        className="p-1.5 rounded-lg text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
                        title="View Hostel Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(hostel)}
                        className="p-1.5 rounded-lg text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
                        title="Edit Hostel"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hostel.id)}
                        className="p-1.5 rounded-lg text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
                        title="Delete Hostel"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Total Rooms</p>
                      <p className="text-lg font-bold text-gray-900">{hostel.totalRooms || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Capacity</p>
                      <p className="text-lg font-bold text-gray-900">{hostel.totalCapacity}</p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Capacity</span>
                      <span className={`text-sm font-bold ${getOccupancyColor(occupancyPercentage)}`}>
                        {occupancyPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {hostel.totalCapacity - hostel.availableCapacity}
                      </span>
                      <span className="text-sm text-gray-500">/ {hostel.totalCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${occupancyPercentage}%`,
                          background: occupancyPercentage >= 90 
                            ? 'linear-gradient(90deg, #dc2626, #ef4444)' 
                            : occupancyPercentage >= 75
                            ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                            : 'linear-gradient(90deg, #2d5016, #4a7c2c)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  {hostel.amenities && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {hostel.amenities.split(',').map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700"
                          >
                            {amenity.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warden Info */}
                  {hostel.wardenName && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Warden</p>
                      <p className="text-sm font-medium text-gray-900">{hostel.wardenName}</p>
                      {hostel.wardenPhone && (
                        <p className="text-xs text-gray-500 mt-0.5">{hostel.wardenPhone}</p>
                      )}
                    </div>
                  )}

                  {/* Quick View Button */}
                  <button
                    onClick={() => handleView(hostel)}
                    className="w-full mt-2 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <EyeIcon className="w-3.5 h-3.5 text-gray-500" />
                    View Hostel & Room Breakdown
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {hostels.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <BuildingIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No hostels added yet</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
            >
              Add Your First Hostel
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingHostel ? 'Edit Hostel' : 'Add New Hostel'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Editable Room Inventory Breakdown */}
              <EditableRoomInventory
                formData={formData}
                onChange={handleInventoryChange}
                onAutoBalanceNonAc={handleAutoBalanceNonAc}
              />

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Boys Hostel A"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
                  <select
                    value={formData.genderType}
                    onChange={(e) => handleChange('genderType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Total Capacity *</label>
                    {formData.autoSync !== false && (
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                        Auto-calculated
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={formData.totalCapacity}
                    onChange={(e) => handleChange('totalCapacity', e.target.value)}
                    disabled={formData.autoSync !== false}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-800 disabled:font-medium"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {formData.autoSync !== false ? 'Calculated from bed counts in Room Inventory' : 'Manual capacity override'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Total Rooms *</label>
                  {formData.autoSync !== false && (
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      Auto-calculated
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) => handleChange('totalRooms', e.target.value)}
                  disabled={formData.autoSync !== false}
                  placeholder="e.g. 60"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-800 disabled:font-medium"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {formData.autoSync !== false ? 'Sum of all sharing room counts' : 'Manual rooms override'}
                </p>
              </div>

              {/* Consistency & Sync Bar */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.autoSync !== false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSyncTotals();
                      } else {
                        setFormData(prev => ({ ...prev, autoSync: false }));
                      }
                    }}
                    className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                  />
                  <span>Keep Total Rooms & Capacity in sync with Room Inventory</span>
                </label>
                {formData.autoSync === false && (
                  <button
                    type="button"
                    onClick={handleSyncTotals}
                    className="text-xs font-semibold text-green-700 hover:text-green-800 underline cursor-pointer"
                  >
                    Sync with Inventory
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => handleChange('amenities', e.target.value)}
                  placeholder="WiFi, Gym, Common Room, Mess (comma separated)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter amenities separated by commas</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Warden Name</label>
                  <input
                    type="text"
                    value={formData.wardenName}
                    onChange={(e) => handleChange('wardenName', e.target.value)}
                    placeholder="Mr. John Doe"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Warden Phone</label>
                  <input
                    type="tel"
                    value={formData.wardenPhone}
                    onChange={(e) => handleChange('wardenPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Campus Road, Main Block"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  editingHostel ? 'Update Hostel' : 'Add Hostel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Hostel Modal */}
      {viewingHostel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingHostel(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] px-6 py-5 text-white flex items-start justify-between rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{viewingHostel.name}</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                    {viewingHostel.genderType} Hostel
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1">{viewingHostel.address || 'No address provided'}</p>
              </div>
              <button
                onClick={() => setViewingHostel(null)}
                className="p-1.5 rounded-lg text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Capacity & Occupancy Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Total Capacity</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{viewingHostel.totalCapacity} beds</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Occupied</p>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">
                    {viewingHostel.totalCapacity - viewingHostel.availableCapacity} beds
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-xl font-bold text-blue-700 mt-0.5">{viewingHostel.availableCapacity} beds</p>
                </div>
              </div>

              {/* Room Breakdown (Individual, 2/3/4 sharing, AC, Non-AC) */}
              <RoomBreakdownSection stats={hostelRoomStats} loading={loadingRoomStats} />

              {/* Warden Details */}
              {(viewingHostel.wardenName || viewingHostel.wardenPhone) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Warden In Charge</h4>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{viewingHostel.wardenName || 'Not Assigned'}</p>
                    {viewingHostel.wardenPhone && (
                      <p className="text-xs text-gray-500 mt-0.5">{viewingHostel.wardenPhone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {viewingHostel.amenities && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hostel Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingHostel.amenities.split(',').map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-medium"
                      >
                        {amenity.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => {
                  const h = viewingHostel;
                  setViewingHostel(null);
                  handleEdit(h);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                Edit Hostel Info
              </button>
              <button
                onClick={() => setViewingHostel(null)}
                className="px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
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
