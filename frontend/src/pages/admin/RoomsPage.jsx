import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

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
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock room data - replace with API call
  const [rooms, setRooms] = useState([
    { id: 1, roomNumber: '101', hostel: 'Boys Hostel A', block: 'A', floor: 1, type: '2-Sharing', capacity: 2, occupied: 2, available: true },
    { id: 2, roomNumber: '102', hostel: 'Boys Hostel A', block: 'A', floor: 1, type: '3-Sharing', capacity: 3, occupied: 2, available: true },
    { id: 3, roomNumber: '103', hostel: 'Boys Hostel A', block: 'A', floor: 1, type: '3-Sharing', capacity: 3, occupied: 3, available: true },
    { id: 4, roomNumber: '104', hostel: 'Boys Hostel A', block: 'A', floor: 1, type: '2-Sharing', capacity: 2, occupied: 0, available: true },
    { id: 5, roomNumber: '201', hostel: 'Boys Hostel A', block: 'A', floor: 2, type: '2-Sharing', capacity: 2, occupied: 2, available: true },
    { id: 6, roomNumber: '202', hostel: 'Boys Hostel A', block: 'A', floor: 2, type: '3-Sharing', capacity: 3, occupied: 1, available: true },
    { id: 7, roomNumber: '105', hostel: 'Girls Hostel A', block: 'A', floor: 1, type: '2-Sharing', capacity: 2, occupied: 2, available: true },
    { id: 8, roomNumber: '106', hostel: 'Girls Hostel A', block: 'A', floor: 1, type: '3-Sharing', capacity: 3, occupied: 0, available: false },
  ]);

  // Available hostels for dropdown
  const hostels = ['Boys Hostel A', 'Boys Hostel B', 'Girls Hostel A'];

  const [formData, setFormData] = useState({
    roomNumber: '',
    hostel: 'Boys Hostel A',
    block: 'A',
    floor: '1',
    type: '2-Sharing',
    capacity: '2',
    available: true,
  });

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostel.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesHostel = hostelFilter === 'all' || room.hostel === hostelFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'full' && room.occupied === room.capacity) ||
      (statusFilter === 'partial' && room.occupied > 0 && room.occupied < room.capacity) ||
      (statusFilter === 'empty' && room.occupied === 0) ||
      (statusFilter === 'unavailable' && !room.available);

    return matchesSearch && matchesHostel && matchesType && matchesStatus;
  });

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      hostel: 'Boys Hostel A',
      block: 'A',
      floor: '1',
      type: '2-Sharing',
      capacity: '2',
      available: true,
    });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      hostel: room.hostel,
      block: room.block,
      floor: room.floor.toString(),
      type: room.type,
      capacity: room.capacity.toString(),
      available: room.available,
    });
    setShowModal(true);
  };

  const handleDelete = (roomId) => {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      setRooms(rooms.filter(r => r.id !== roomId));
    }
  };

  const handleToggleAvailable = (roomId) => {
    setRooms(rooms.map(r => 
      r.id === roomId ? { ...r, available: !r.available } : r
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const roomData = {
      ...formData,
      floor: parseInt(formData.floor),
      capacity: parseInt(formData.capacity),
      occupied: editingRoom?.occupied || 0,
    };

    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...roomData } : r));
    } else {
      setRooms([...rooms, { id: Date.now(), ...roomData }]);
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Auto-update capacity based on type
      if (field === 'type') {
        newData.capacity = value === '2-Sharing' ? '2' : '3';
      }
      return newData;
    });
  };

  const getOccupancyBadge = (room) => {
    if (!room.available) {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Unavailable</span>;
    }
    
    if (room.occupied === 0) {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Empty
      </span>;
    }
    
    if (room.occupied === room.capacity) {
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

  // Calculate statistics
  const stats = {
    total: rooms.length,
    full: rooms.filter(r => r.occupied === r.capacity && r.available).length,
    partial: rooms.filter(r => r.occupied > 0 && r.occupied < r.capacity && r.available).length,
    empty: rooms.filter(r => r.occupied === 0 && r.available).length,
    unavailable: rooms.filter(r => !r.available).length,
    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    totalOccupied: rooms.reduce((sum, r) => sum + r.occupied, 0),
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
              {Math.round((stats.totalOccupied / stats.totalCapacity) * 100)}%
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
                  <option key={hostel} value={hostel}>{hostel}</option>
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
                      <span className="text-sm text-gray-700">{room.hostel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{room.block}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{room.floor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{room.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{room.capacity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{room.occupied}</span>
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
                            room.available 
                              ? 'text-emerald-600 hover:bg-emerald-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={room.available ? 'Mark as Unavailable' : 'Mark as Available'}
                        >
                          {room.available ? (
                            <CheckCircleIcon className="w-4 h-4" />
                          ) : (
                            <XCircleIcon className="w-4 h-4" />
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
                  value={formData.hostel}
                  onChange={(e) => handleChange('hostel', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {hostels.map(hostel => (
                    <option key={hostel} value={hostel}>{hostel}</option>
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
                    min="1"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="2-Sharing">2-Sharing</option>
                  <option value="3-Sharing">3-Sharing</option>
                </select>
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
                  checked={formData.available}
                  onChange={(e) => handleChange('available', e.target.checked)}
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
                disabled={saving || !formData.roomNumber || !formData.capacity}
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
