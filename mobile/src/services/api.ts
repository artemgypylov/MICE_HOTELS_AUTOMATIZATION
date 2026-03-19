import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../utils/constants';
import type {
  User,
  Hotel,
  Hall,
  CateringItem,
  Service,
  Booking,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
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
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Hotels API
export const hotelsAPI = {
  getAll: async (): Promise<Hotel[]> => {
    const response = await api.get<Hotel[]>('/hotels');
    return response.data;
  },

  getById: async (id: string): Promise<Hotel> => {
    const response = await api.get<Hotel>(`/hotels/${id}`);
    return response.data;
  },

  getHalls: async (hotelId: string): Promise<Hall[]> => {
    const response = await api.get<Hall[]>(`/hotels/${hotelId}/halls`);
    return response.data;
  },

  getCatering: async (hotelId: string): Promise<CateringItem[]> => {
    const response = await api.get<CateringItem[]>(`/hotels/${hotelId}/catering`);
    return response.data;
  },

  getServices: async (hotelId: string): Promise<Service[]> => {
    const response = await api.get<Service[]>(`/hotels/${hotelId}/services`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (data: Partial<Booking>): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  getAll: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Booking>): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  calculate: async (id: string): Promise<{ totalPrice: number }> => {
    const response = await api.post<{ totalPrice: number }>(`/bookings/${id}/calculate`);
    return response.data;
  },

  submit: async (id: string): Promise<Booking> => {
    const response = await api.post<Booking>(`/bookings/${id}/submit`);
    return response.data;
  },
};

export default api;
