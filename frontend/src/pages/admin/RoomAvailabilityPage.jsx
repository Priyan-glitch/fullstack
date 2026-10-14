import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { HOSTEL_API_BASE_URL, API_ENDPOINTS } from '../../config/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_TYPES = [
  {
    key: 'INDIVIDUAL',
    label: 'Individual',
    number: '1',
    description: 'Single occupancy room — one student per room',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    color: 'purple',
  },
  {
    key: '2_SHARING',
    label: '2-Sharing',
    number: '2',
    description: 'Double occupancy room — two students per room',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    key: '3_SHARING',
    label: '3-Sharing',
    number: '3',
    description: 'Triple occupancy room — three students per room',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    color: 'green',
  },
  {
    key: '4_SHARING',
    label: '4-Sharing',
    number: '4',
    description: 'Quad occupancy room — four students per room',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    color: 'orange',
  },
];

const COLOR_MAP = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'bg-blue-100 text-blue-700',   badge: 'bg-blue-100 text-blue-700'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'bg-green-100 text-green-700', badge: 'bg-green-100 text-green-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-700', badge: 'bg-orange-100 text-orange-700' },
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
        checked ? 'bg-green-600' : 'bg-gray-200'
      }`}
    >
      <span className="sr-only">{label}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── RoomTypeCard ─────────────────────────────────────────────────────────────

function RoomTypeCard({ rtMeta, configs, onToggle, onCountChange, saving }) {
  const acConfig    = configs.find(c => c.roomType === rtMeta.key && c.acType === 'AC');
  const nonAcConfig = configs.find(c => c.roomType === rtMeta.key && c.acType === 'NON_AC');
  const colors      = COLOR_MAP[rtMeta.color];

  const enabledCount = [acConfig?.available, nonAcConfig?.available].filter(Boolean).length;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
      enabledCount > 0 ? `${colors.border} ${colors.bg}` : 'border-gray-200 bg-white'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}>
            {rtMeta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{rtMeta.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{rtMeta.description}</p>
          </div>
        </div>
        <div>
          {enabledCount > 0 ? (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
              {enabledCount === 2 ? 'AC + Non-AC' : acConfig?.available ? 'AC only' : 'Non-AC only'} enabled
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              Disabled
            </span>
          )}
        </div>
      </div>

      {/* AC / Non-AC rows */}
      <div className="divide-y divide-gray-100">
        {[
          { config: acConfig,    label: 'AC Room',     acType: 'AC',     emoji: '' },
          { config: nonAcConfig, label: 'Non-AC Room', acType: 'NON_AC', emoji: '' },
        ].map(({ config, label, acType, emoji }) =>
          config ? (
            <div key={acType} className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  {config.available && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                      Open
                    </span>
                  )}
                </div>
                <Toggle
                  checked={!!config.available}
                  onChange={() => !saving && onToggle(config.id)}
                  label={`Toggle ${label}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total Rooms</label>
                  <input
                    type="number"
                    min="0"
                    value={config.totalRooms ?? 0}
                    onChange={e => onCountChange(config.id, 'totalRooms', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Available Rooms</label>
                  <input
                    type="number"
                    min="0"
                    max={config.totalRooms ?? 0}
                    value={config.availableRooms ?? 0}
                    onChange={e => onCountChange(config.id, 'availableRooms', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>

              {config.totalRooms > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>{config.availableRooms} available</span>
                    <span>{(config.totalRooms || 0) - (config.availableRooms || 0)} occupied</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                      style={{ width: `${config.totalRooms > 0 ? Math.round((config.availableRooms / config.totalRooms) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RoomAvailabilityPage() {
  const [configs, setConfigs]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError]             = useState(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_TYPE_CONFIG}`);
      if (!res.ok) throw new Error('Failed to fetch room type config');
      setConfigs(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const handleToggle = async (id) => {
    // Optimistic update
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, available: !c.available } : c));
    try {
      const res = await fetch(
        `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_TYPE_CONFIG_TOGGLE(id)}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setConfigs(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      fetchConfigs(); // Revert on failure
    }
  };

  const handleCountChange = (id, field, value) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(
        `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_TYPE_CONFIG_BULK}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configs),
        }
      );
      if (!res.ok) throw new Error('Save failed');
      setConfigs(await res.json());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const [syncing, setSyncing]         = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      const res = await fetch(
        `${HOSTEL_API_BASE_URL}${API_ENDPOINTS.ROOM_TYPE_CONFIG_SYNC}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Sync failed');
      setConfigs(await res.json());
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch {
      setError('Failed to sync room inventory. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const enabledCombos  = configs.filter(c => c.available).length;
  const totalRooms     = configs.reduce((s, c) => s + (c.totalRooms || 0), 0);
  const availableRooms = configs.reduce((s, c) => s + (c.availableRooms || 0), 0);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Type Availability</h1>
            <p className="text-sm text-gray-500 mt-1">
              Control which room types students can see and select in Preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing || saving || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              title="Automatically calculate room counts and vacant beds from registered rooms"
            >
              <svg className={`w-4 h-4 text-gray-500 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? 'Syncing…' : syncSuccess ? 'Synced with Rooms!' : 'Sync from Inventory'}
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving…
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd"/>
                  </svg>
                  Saved!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Types Enabled',  value: `${enabledCombos} / 8` },
            { label: 'Total Rooms',    value: totalRooms              },
            { label: 'Available Beds', value: availableRooms          },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 1 0 1.06 1.06L10 11.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L11.06 10l2.72-2.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-red-800 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 cursor-pointer">✕</button>
          </div>
        )}

        {/* Info note */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900">How this works</p>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              Toggle a combination to make it visible to students. Toggles take effect immediately.
              Room counts require <strong>Save Changes</strong>. Students only see enabled types in their Preferences form.
            </p>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROOM_TYPES.map(rt => (
              <RoomTypeCard
                key={rt.key}
                rtMeta={rt}
                configs={configs}
                onToggle={handleToggle}
                onCountChange={handleCountChange}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
