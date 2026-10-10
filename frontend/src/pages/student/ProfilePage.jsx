import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import StudentLayout from '../../layouts/StudentLayout';

// Simple icon components
const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EnvelopeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const AcademicCapIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const BuildingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Input field component - moved outside to prevent re-creation on state changes
const InputField = ({ label, field, type = 'text', disabled = false, icon: Icon, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-sm border rounded-lg transition-colors
          ${disabled 
            ? 'bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed' 
            : 'bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
          }`}
      />
    </div>
  </div>
);

// Select field component - moved outside to prevent re-creation on state changes
const SelectField = ({ label, field, options, disabled = false, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">
      {label}
    </label>
    <select
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors
        ${disabled 
          ? 'bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed' 
          : 'bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
        }`}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Initialize profile from user context
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (user) {
      const profileData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        rollNumber: user.registerNumber || '', // Map registerNumber to rollNumber for display
        registerNumber: user.registerNumber || '', // Keep for API
        department: user.department || '',
        year: user.year || '',
        semester: user.semester || '',
        dateOfBirth: user.dateOfBirth || '',
        bloodGroup: user.bloodGroup || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        guardianName: user.guardianName || '',
        guardianPhone: user.guardianPhone || '',
        guardianRelation: user.guardianRelation || '',
        emergencyContact: user.emergencyContact || '',
      };
      setProfile(profileData);
      setFormData(profileData);
      setLoading(false);
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STUDENT_BY_ID(user.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedStudent = await response.json();
      
      // Update local state and context
      setProfile(formData);
      updateUser(updatedStudent);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Failed to load profile</div>
        </div>
      </StudentLayout>
    );
  }

  const profileCompletion = 100; // Calculate based on filled fields

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your personal information</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
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
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Profile Completion */}
          {profileCompletion === 100 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Profile Complete</p>
                <p className="text-xs text-emerald-600 mt-0.5">Your profile is 100% complete and ready for allocation.</p>
              </div>
            </div>
          )}

          {/* Profile Picture & Basic Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{profile.rollNumber}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {profile.department} • Year {profile.year} • Semester {profile.semester}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                Personal Information
              </h3>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="First Name" 
                  field="firstName" 
                  icon={UserIcon} 
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Last Name" 
                  field="lastName" 
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Email Address" 
                  field="email" 
                  type="email" 
                  icon={EnvelopeIcon} 
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={true}
                />
                <InputField 
                  label="Phone Number" 
                  field="phone" 
                  type="tel" 
                  icon={PhoneIcon} 
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Date of Birth" 
                  field="dateOfBirth" 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
                <SelectField 
                  label="Blood Group" 
                  field="bloodGroup" 
                  options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} 
                  value={formData.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  disabled={!isEditing}
                />
                <SelectField 
                  label="Gender" 
                  field="gender" 
                  options={['Male', 'Female', 'Other', 'Prefer not to say']} 
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                Academic Information
              </h3>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Roll Number" 
                  field="rollNumber" 
                  value={formData.rollNumber}
                  onChange={(e) => handleChange('rollNumber', e.target.value)}
                  disabled={true}
                />
                <InputField 
                  label="Department" 
                  field="department" 
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  disabled={true}
                />
                <SelectField 
                  label="Current Year" 
                  field="year" 
                  options={['1', '2', '3', '4']} 
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  disabled={true}
                />
                <SelectField 
                  label="Current Semester" 
                  field="semester" 
                  options={['1', '2', '3', '4', '5', '6', '7', '8']} 
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                Address Information
              </h3>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4">
                <InputField 
                  label="Street Address" 
                  field="address" 
                  icon={BuildingIcon} 
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField 
                    label="City" 
                    field="city" 
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    disabled={!isEditing}
                  />
                  <InputField 
                    label="State" 
                    field="state" 
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    disabled={!isEditing}
                  />
                  <InputField 
                    label="PIN Code" 
                    field="pincode" 
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guardian & Emergency Contact */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-500" />
                Guardian & Emergency Contact
              </h3>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Guardian Name" 
                  field="guardianName" 
                  icon={UserIcon} 
                  value={formData.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Guardian Phone" 
                  field="guardianPhone" 
                  type="tel" 
                  icon={PhoneIcon} 
                  value={formData.guardianPhone}
                  onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  disabled={!isEditing}
                />
                <SelectField 
                  label="Relation" 
                  field="guardianRelation" 
                  options={['Father', 'Mother', 'Guardian', 'Other']} 
                  value={formData.guardianRelation}
                  onChange={(e) => handleChange('guardianRelation', e.target.value)}
                  disabled={!isEditing}
                />
                <InputField 
                  label="Emergency Contact" 
                  field="emergencyContact" 
                  type="tel" 
                  icon={PhoneIcon} 
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
