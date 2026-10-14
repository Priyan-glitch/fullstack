import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { HOSTEL_API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { percentLabel } from '../../utils/number';
import { apiFetch } from '../../lib/http';

// Simple icon components
const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function RoomsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hostelFilter, setHostelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [acFilter, setAcFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isRoomAc = (room) => {
    if (!room?.amenities) return false;
    return /\b(AC|A\/C|AIR[\s-]CONDITION(ING|ER)?)\b/i.test(room.amenities);
  };

  useEffect(() => {
    fetchHostels();
    fetchRooms();
  }, []);

  const fetchHostels = async () => {
    try {
      const response = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.HOSTELS}`);
      if (!response.ok) throw new Error('Failed to fetch hostels');
      const data = await response.json();
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOMS}`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    roomNumber: '',
    hostelId: '',
    floor: '',
    block: '',
    roomType: '2-Sharing',
    capacity: 2,
    currentOccupancy: 0,
    status: 'AVAILABLE',
    isAc: false,
  });

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHostel = hostelFilter === 'all' || room.hostelId?.toString() === hostelFilter;
    const matchesAc = acFilter === 'all' || (acFilter === 'AC' ? isRoomAc(room) : !isRoomAc(room));
    const matchesType = typeFilter === 'all' || (() => {
      const rt = (room.roomType || '').toUpperCase().replace('-', '_');
      const tf = typeFilter.toUpperCase().replace('-', '_');
      if (tf.includes('INDIVIDUAL') || tf.includes('1')) return rt.includes('INDIVIDUAL') || rt.includes('1') || room.capacity === 1;
      if (tf.includes('4')) return rt.includes('4') || room.capacity === 4;
      if (tf.includes('3')) return rt.includes('3') || room.capacity === 3;
      if (tf.includes('2')) return rt.includes('2') || room.capacity === 2;
      return room.roomType === typeFilter;
    })();
    
    // Status filter logic
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const occupied = room.occupiedCount || 0;
      const capacity = room.capacity || 0;
      const status = room.status || 'AVAILABLE';
      
      if (statusFilter === 'empty') {
        matchesStatus = occupied === 0 && status === 'AVAILABLE';
      } else if (statusFilter === 'partial') {
        matchesStatus = occupied > 0 && occupied < capacity && status !== 'MAINTENANCE';
      } else if (statusFilter === 'full') {
        matchesStatus = occupied >= capacity || status === 'FULL';
      } else if (statusFilter === 'unavailable') {
        matchesStatus = status === 'MAINTENANCE';
      }
    }

    return matchesSearch && matchesHostel && matchesType && matchesAc && matchesStatus;
  });

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      hostelId: '',
      floor: '',
      block: '',
      roomType: '2-Sharing',
      capacity: 2,
      currentOccupancy: 0,
      status: 'AVAILABLE',
      isAc: false,
    });
    setShowModal(true);
  };

  const normalizeRoomType = (rt) => {
    if (!rt) return '2-Sharing';
    const u = rt.toUpperCase().replace('-', '_');
    if (u.includes('INDIVIDUAL') || u.includes('1')) return 'Individual';
    if (u.includes('4')) return '4-Sharing';
    if (u.includes('3')) return '3-Sharing';
    return '2-Sharing';
  };

  const toDbRoomType = (rt) => {
    const u = (rt || '').toUpperCase().replace('-', '_');
    if (u.includes('INDIVIDUAL') || u.includes('1')) return 'INDIVIDUAL';
    if (u.includes('4')) return '4-SHARING';
    if (u.includes('3')) return '3-SHARING';
    return '2-SHARING';
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      hostelId: room.hostelId?.toString() || '',
      block: room.block || '',
      floor: room.floor !== undefined && room.floor !== null ? room.floor.toString() : '1',
      roomType: normalizeRoomType(room.roomType),
      capacity: room.capacity?.toString() || '2',
      currentOccupancy: room.occupiedCount || 0,
      status: room.status || 'AVAILABLE',
      isAc: isRoomAc(room),
    });
    setShowModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    
    try {
      const response = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_BY_ID(roomId)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete room');
      
      // Refresh room list
      await fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Failed to delete room');
    }
  };

  const handleToggleAvailable = async (roomId) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      const newStatus = room.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';

      const response = await apiFetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_BY_ID(roomId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...room,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle room availability');
      
      // Refresh room list
      await fetchRooms();
    } catch (err) {
      console.error('Error toggling room availability:', err);
      alert('Failed to toggle room availability');
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);

    try {
      let updatedAmenities = editingRoom?.amenities || 'Attached Bathroom, Beds, Study Table, Wardrobe';
      if (formData.isAc) {
        if (!isRoomAc({ amenities: updatedAmenities })) {
          updatedAmenities = updatedAmenities ? `AC, ${updatedAmenities}` : 'AC';
        }
      } else {
        updatedAmenities = updatedAmenities
          .replace(/\b(AC|A\/C|Air Condition(ing|er)?)\b/gi, '')
          .replace(/,\s*,/g, ',')
          .replace(/^,\s*/, '')
          .replace(/,\s*$/, '')
          .trim();
      }

      const resolvedStatus = formData.status === 'MAINTENANCE'
        ? 'MAINTENANCE'
        : (editingRoom?.status && editingRoom.status !== 'MAINTENANCE' ? editingRoom.status : 'AVAILABLE');

      const roomData = {
        roomNumber: formData.roomNumber,
        hostelId: parseInt(formData.hostelId),
        floor: formData.floor !== '' ? parseInt(formData.floor) : 1,
        block: formData.block,
        roomType: toDbRoomType(formData.roomType),
        capacity: parseInt(formData.capacity),
        occupiedCount: editingRoom?.occupiedCount || 0,
        status: resolvedStatus,
        amenities: updatedAmenities,
      };

      const url = editingRoom 
        ? `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_BY_ID(editingRoom.id)}`
        : `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOMS}`;
      
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) throw new Error('Failed to save room');

      // Refresh room list
      await fetchRooms();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving room:', err);
      alert('Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Auto-update capacity based on roomType
      if (field === 'roomType') {
        const val = (value || '').toUpperCase();
        if (val.includes('INDIVIDUAL') || val.includes('1')) newData.capacity = '1';
        else if (val.includes('4')) newData.capacity = '4';
        else if (val.includes('3')) newData.capacity = '3';
        else newData.capacity = '2';
      }
      return newData;
    });
  };

  const getOccupancyBadge = (room) => {
    const status = room.status || 'AVAILABLE';
    
    if (status === 'MAINTENANCE') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Unavailable</span>;
    }
    
    if (room.occupiedCount === 0 || status === 'AVAILABLE') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Empty
      </span>;
    }
    
    if (room.occupiedCount >= room.capacity || status === 'FULL') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Full
      </span>;
    }
    
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Partial
    </span>;
  };

  // Helper to get hostel name from ID
  const getHostelName = (hostelId) => {
    const hostel = hostels.find(h => h.id === hostelId);
    return hostel ? hostel.name : 'Unknown';
  };

  // Calculate statistics
  const stats = {
    total: rooms.length,
    full: rooms.filter(r => r.status === 'FULL' || r.occupiedCount === r.capacity).length,
    partial: rooms.filter(r => r.occupiedCount > 0 && r.occupiedCount < r.capacity && r.status !== 'MAINTENANCE').length,
    empty: rooms.filter(r => r.occupiedCount === 0 && r.status === 'AVAILABLE').length,
    unavailable: rooms.filter(r => r.status === 'MAINTENANCE').length,
    totalCapacity: rooms.reduce((sum, r) => sum + (r.capacity || 0), 0),
    totalOccupied: rooms.reduce((sum, r) => sum + (r.occupiedCount || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage rooms and occupancy</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
          >
            <PlusIcon className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Empty</p>
            <p className="text-2xl font-bold text-blue-600">{stats.empty}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Partial</p>
            <p className="text-2xl font-bold text-amber-600">{stats.partial}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Full</p>
            <p className="text-2xl font-bold text-red-600">{stats.full}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Unavailable</p>
            <p className="text-2xl font-bold text-gray-600">{stats.unavailable}</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4">
            <p className="text-xs text-gray-500 mb-1">Occupancy</p>
            <p className="text-2xl font-bold text-emerald-600">
              {percentLabel(stats.totalOccupied, stats.totalCapacity) ?? '—'}
            </p>
          </div>
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
                  placeholder="Search by room number or hostel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Hostel Filter */}
            <div>
              <select
                value={hostelFilter}
                onChange={(e) => setHostelFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Hostels</option>
                {hostels.map(hostel => (
                  <option key={hostel.id} value={hostel.id.toString()}>{hostel.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="2-Sharing">2-Sharing</option>
                <option value="3-Sharing">3-Sharing</option>
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
                <option value="empty">Empty</option>
                <option value="partial">Partial</option>
                <option value="full">Full</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredRooms.length} of {rooms.length} rooms</span>
            {(searchQuery || hostelFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setHostelFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
              >
                <RefreshIcon className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hostel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Block</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Floor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AC / Non-AC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Occupied</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-gray-900">{room.roomNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{getHostelName(room.hostelId)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{room.block || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{room.floor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{room.roomType}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isRoomAc(room) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <span className="text-[11px]"></span> AC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                          <span className="text-[11px]"></span> Non-AC
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{room.capacity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{room.occupiedCount || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getOccupancyBadge(room)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
                          title="Edit Room"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAvailable(room.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            room.status === 'MAINTENANCE'
                              ? 'text-gray-400 hover:bg-gray-100' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={room.status === 'MAINTENANCE' ? 'Mark as Available' : 'Mark as Unavailable'}
                        >
                          {room.status === 'MAINTENANCE' ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Room"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No rooms found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Number *</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => handleChange('roomNumber', e.target.value)}
                  placeholder="e.g., 101"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hostel *</label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => handleChange('hostelId', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Hostel</option>
                  {hostels.map(hostel => (
                    <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Block *</label>
                  <input
                    type="text"
                    value={formData.block}
                    onChange={(e) => handleChange('block', e.target.value)}
                    placeholder="A"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Floor *</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => handleChange('floor', e.target.value)}
                    placeholder="1"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type *</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => handleChange('roomType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Individual">Individual (1-Sharing)</option>
                    <option value="2-Sharing">2-Sharing</option>
                    <option value="3-Sharing">3-Sharing</option>
                    <option value="4-Sharing">4-Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">AC / Non-AC *</label>
                  <select
                    value={formData.isAc ? 'AC' : 'NON_AC'}
                    onChange={(e) => handleChange('isAc', e.target.value === 'AC')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="NON_AC"> Non-AC Room</option>
                    <option value="AC"> AC Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.status !== 'MAINTENANCE'}
                  onChange={(e) => handleChange('status', e.target.checked ? 'AVAILABLE' : 'MAINTENANCE')}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">
                  Room is available for allocation
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.roomNumber || !formData.hostelId || !formData.capacity}
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
                  editingRoom ? 'Update Room' : 'Add Room'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
