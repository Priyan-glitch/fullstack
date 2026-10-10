// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
export const HOSTEL_API_BASE_URL = import.meta.env.VITE_HOSTEL_API_BASE_URL || 'http://localhost:8082';
export const ALLOCATION_API_BASE_URL = import.meta.env.VITE_ALLOCATION_API_BASE_URL || 'http://localhost:8083';

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
  
  // Allocations
  ALLOCATION_BY_STUDENT: (studentId) => `/api/allocations/student/${studentId}`,
  ALLOCATION_ROOMMATES: (studentId) => `/api/allocations/student/${studentId}/roommates`,
  ALLOCATION_TRIGGER: '/api/allocations/trigger',
  ALLOCATION_SAMPLE: (studentId) => `/api/allocations/student/${studentId}/sample`,
  
  // Hostels
  HOSTELS: '/api/hostels',
  HOSTEL_BY_ID: (id) => `/api/hostels/${id}`,
  HOSTEL_STATS: '/api/dashboard/stats',
  
  // Rooms
  ROOMS: '/api/rooms',
  ROOM_BY_ID: (id) => `/api/rooms/${id}`,
  ROOMS_BY_HOSTEL: (hostelId) => `/api/rooms/hostel/${hostelId}`,
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
