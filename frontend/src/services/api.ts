import axios, { AxiosInstance } from 'axios';
import { ApiResponse, LoginResponse, RegisterResponse, Trip, User, CreateTripRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear token and redirect if we're not on the login page
      // This prevents the interceptor from interfering with login attempts
      if (window.location.pathname !== '/') {
        console.log('Authentication failed, clearing token and redirecting to login');
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, username: string, password: string): Promise<ApiResponse<RegisterResponse>> => {
    const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', {
      email,
      username,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },
};

// Trip API
export const tripApi = {
  getAll: async (): Promise<ApiResponse<Trip[]>> => {
    const response = await api.get<ApiResponse<Trip[]>>('/trips');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
    return response.data;
  },

  create: async (trip: CreateTripRequest): Promise<ApiResponse<Trip>> => {
    const response = await api.post<ApiResponse<Trip>>('/trips', trip);
    return response.data;
  },

  update: async (id: string, trip: Partial<Trip>): Promise<ApiResponse<Trip>> => {
    const response = await api.put<ApiResponse<Trip>>(`/trips/${id}`, trip);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/trips/${id}`);
  },

  addLocationToDay: async (tripId: string, dayNumber: number, location: any): Promise<ApiResponse<Trip>> => {
    const response = await api.post<ApiResponse<Trip>>(`/trips/${tripId}/days/${dayNumber}/locations`, location);
    return response.data;
  },

  removeLocationFromDay: async (tripId: string, dayNumber: number, locationId: string): Promise<ApiResponse<Trip>> => {
    const response = await api.delete<ApiResponse<Trip>>(`/trips/${tripId}/days/${dayNumber}/locations/${locationId}`);
    return response.data;
  },

  reorderLocationsInDay: async (tripId: string, dayNumber: number, locationIds: string[]): Promise<ApiResponse<Trip>> => {
    const response = await api.put<ApiResponse<Trip>>(`/trips/${tripId}/days/${dayNumber}/locations/reorder`, { locationIds });
    return response.data;
  },
};

// Saved Location API
export const savedLocationApi = {
  getAll: async (tripId?: string): Promise<ApiResponse<any[]>> => {
    const url = tripId ? `/saved-locations?trip_id=${tripId}` : '/saved-locations';
    const response = await api.get<ApiResponse<any[]>>(url);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(`/saved-locations/${id}`);
    return response.data;
  },

  create: async (location: any): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/saved-locations', location);
    return response.data;
  },

  update: async (id: string, location: any): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>(`/saved-locations/${id}`, location);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/saved-locations/${id}`);
  },
};

export default api;

