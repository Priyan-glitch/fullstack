import { apiFetch } from '../lib/http';

// API Configuration
//
// Every API call goes through the gateway (gateway/Caddyfile), which verifies
// the JWT issued by auth-service before proxying to a service. One origin for
// all services, so CORS is a single relationship instead of five.
//
// The per-service env vars are kept so you can bypass the gateway while
// developing a single service — set e.g. VITE_API_BASE_URL=http://localhost:8081
// in frontend/.env.local. Left unset, everything points at the gateway.
export const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || GATEWAY_BASE_URL;
export const HOSTEL_API_BASE_URL = import.meta.env.VITE_HOSTEL_API_BASE_URL || GATEWAY_BASE_URL;
export const ALLOCATION_SERVICE_URL = import.meta.env.VITE_ALLOCATION_SERVICE_URL || GATEWAY_BASE_URL;
export const NOTIFICATION_API_BASE_URL = import.meta.env.VITE_NOTIFICATION_API_BASE_URL || GATEWAY_BASE_URL;
export const ALGORITHM_API_BASE_URL = import.meta.env.VITE_ALGORITHM_API_BASE_URL || GATEWAY_BASE_URL;
// Alias kept for backward-compat with files that still import the old name
export const ALLOCATION_API_BASE_URL = API_BASE_URL;

export const API_ENDPOINTS = {
  // Authentication (auth-service, via the gateway).
  // login/register are the only endpoints the gateway lets through without a
  // token; /me requires one.
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_ME: '/api/auth/me',
  
  // Admin Dashboard
  ADMIN_STATS: '/api/students/admin/stats',
  
  // Students
  STUDENTS: '/api/students',
  STUDENT_BY_ID: (id) => `/api/students/${id}`,
  STUDENT_BY_EMAIL: (email) => `/api/students/email/${email}`,
  STUDENT_BY_REGISTER: (registerNumber) => `/api/students/register-number/${registerNumber}`,
  STUDENTS_BY_DEPARTMENT: (department) => `/api/students/department/${department}`,
  STUDENTS_BY_YEAR: (year) => `/api/students/year/${year}`,
  STUDENTS_SEARCH: '/api/students/search',
  TOGGLE_STUDENT_ACTIVE: (id) => `/api/students/${id}/toggle-active`,
  
  // Preferences
  PREFERENCES_BY_STUDENT: (studentId) => `/api/preferences/student/${studentId}`,
  PREFERENCES_SAVE: (studentId) => `/api/preferences/student/${studentId}`,
  PREFERENCES_EXISTS: (studentId) => `/api/preferences/student/${studentId}/exists`,
  
  // Student-service allocation (student-facing).
  // Note the two distinct prefixes: /api/allocations/* is served by
  // student-service, /api/allocation/* by allocation-service. They are separate
  // path segments, so the gateway routes them unambiguously.
  ALLOCATION_BY_STUDENT: (studentId) => `/api/allocations/student/${studentId}`,
  ALLOCATION_ROOMMATES: (studentId) => `/api/allocation/student/${studentId}/roommates`,
  ALLOCATION_TRIGGER: '/api/allocation/trigger',
  ALLOCATION_SAMPLE: (studentId) => `/api/allocation/student/${studentId}/sample`,

  // Algorithm Engine (admin-facing, port 8090)
  ALGO_STRATEGIES: '/api/v1/allocation/strategies',
  ALGO_RUN: '/api/v1/allocation/run',
  ALGO_RUNS: '/api/v1/allocation/runs',
  ALGO_RUN_BY_ID: (id) => `/api/v1/allocation/runs/${id}`,
  ALGO_APPROVE: (id) => `/api/v1/allocation/runs/${id}/approve`,
  ALGO_REJECT: (id) => `/api/v1/allocation/runs/${id}/reject`,
  
  // Hostels
  HOSTELS: '/api/hostels',
  HOSTEL_BY_ID: (id) => `/api/hostels/${id}`,
  HOSTEL_STATS: '/api/dashboard/stats',
  
  // Rooms
  ROOMS: '/api/rooms',
  ROOM_BY_ID: (id) => `/api/rooms/${id}`,
  ROOMS_BY_HOSTEL: (hostelId) => `/api/rooms/hostel/${hostelId}`,
  ROOMS_SYNC_INVENTORY: (hostelId) => `/api/rooms/hostel/${hostelId}/sync-inventory`,

  // Room Type Availability Config
  ROOM_TYPE_CONFIG: '/api/room-type-config',
  ROOM_TYPE_CONFIG_AVAILABLE: '/api/room-type-config/available',
  ROOM_TYPE_CONFIG_BY_ID: (id) => `/api/room-type-config/${id}`,
  ROOM_TYPE_CONFIG_TOGGLE: (id) => `/api/room-type-config/${id}/toggle`,
  ROOM_TYPE_CONFIG_BULK: '/api/room-type-config/bulk',
  ROOM_TYPE_CONFIG_SYNC: '/api/room-type-config/sync',

  // Notifications (port 8084)
  NOTIFICATIONS_FOR_USER: (userId) => `/api/notifications/${userId}`,
  NOTIFICATIONS_UNREAD: (userId) => `/api/notifications/${userId}/unread-count`,
  NOTIFICATIONS_MARK_READ: (id, userId) => `/api/notifications/${id}/read?userId=${userId}`,
  NOTIFICATIONS_MARK_ALL_READ: (userId) => `/api/notifications/${userId}/mark-all-read`,
  NOTIFICATIONS_DELETE: (id) => `/api/notifications/${id}`,
};

// Notification Service API helpers
export const notificationApi = {
  getNotifications: async (userId) => {
    const res = await apiFetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_FOR_USER(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
  getUnreadCount: async (userId) => {
    const res = await apiFetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_UNREAD(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch unread count');
    return res.json();
  },
  markRead: async (id, userId) => {
    const res = await apiFetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_MARK_READ(id, userId)}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },
  markAllRead: async (userId) => {
    const res = await apiFetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ(userId)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
    return res.json();
  },
  delete: async (id) => {
    const res = await apiFetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_DELETE(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return res.json();
  },
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await apiFetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
