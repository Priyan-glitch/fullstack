// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
export const HOSTEL_API_BASE_URL = import.meta.env.VITE_HOSTEL_API_BASE_URL || 'http://localhost:8082';
export const ALLOCATION_SERVICE_URL = import.meta.env.VITE_ALLOCATION_SERVICE_URL || 'http://localhost:8083';
export const NOTIFICATION_API_BASE_URL = import.meta.env.VITE_NOTIFICATION_API_BASE_URL || 'http://localhost:8084';
export const ALGORITHM_API_BASE_URL = import.meta.env.VITE_ALGORITHM_API_BASE_URL || 'http://localhost:8090';
// Alias kept for backward-compat with files that still import the old name
export const ALLOCATION_API_BASE_URL = API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/students/login',
  
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
  
  // Student-service allocation (student-facing)
  ALLOCATION_BY_STUDENT: (studentId) => `/api/allocations/student/${studentId}`,
  ALLOCATION_ROOMMATES: (studentId) => `/api/allocations/student/${studentId}/roommates`,
  ALLOCATION_TRIGGER: '/api/allocations/trigger',
  ALLOCATION_SAMPLE: (studentId) => `/api/allocations/student/${studentId}/sample`,

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
    const res = await fetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_FOR_USER(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
  getUnreadCount: async (userId) => {
    const res = await fetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_UNREAD(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch unread count');
    return res.json();
  },
  markRead: async (id, userId) => {
    const res = await fetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_MARK_READ(id, userId)}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },
  markAllRead: async (userId) => {
    const res = await fetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ(userId)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${NOTIFICATION_API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_DELETE(id)}`, {
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
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
