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

export default function HostelsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
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

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalCapacity: '',
    totalRooms: '',
    genderType: 'MALE',
    wardenName: '',
    wardenPhone: '',
    amenities: '',
  });

  const handleAdd = () => {
    setEditingHostel(null);
    setFormData({
      name: '',
      address: '',
      totalCapacity: '',
      totalRooms: '',
      genderType: 'MALE',
      wardenName: '',
      wardenPhone: '',
      amenities: '',
    });
    setShowModal(true);
  };

  const handleEdit = (hostel) => {
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
    });
    setShowModal(true);
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
      const hostelData = {
        ...formData,
        totalCapacity: parseInt(formData.totalCapacity),
        totalRooms: parseInt(formData.totalRooms),
        availableCapacity: editingHostel ? editingHostel.availableCapacity : parseInt(formData.totalCapacity),
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

      await fetchHostels();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving hostel:', err);
      alert('Failed to save hostel');
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Capacity *</label>
                  <input
                    type="number"
                    value={formData.totalCapacity}
                    onChange={(e) => handleChange('totalCapacity', e.target.value)}
                    placeholder="300"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Rooms *</label>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) => handleChange('totalRooms', e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                disabled={saving || !formData.name || !formData.totalCapacity || !formData.totalRooms}
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
    </AdminLayout>
  );
}
