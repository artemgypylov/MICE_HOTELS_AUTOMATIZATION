import axios from 'axios';
import { CreateSupplierDTO, UpdateSupplierDTO, Supplier } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Supplier specific API calls
const supplier = {
  listSuppliers: async (): Promise<Supplier[]> => {
    const response = await axiosInstance.get('/suppliers');
    return response.data;
  },
  createSupplier: async (data: CreateSupplierDTO): Promise<Supplier> => {
    const response = await axiosInstance.post('/suppliers', data);
    return response.data;
  },
  updateSupplier: async (id: string, data: UpdateSupplierDTO): Promise<Supplier> => {
    const response = await axiosInstance.put(`/suppliers/${id}`, data);
    return response.data;
  },
  deleteSupplier: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/suppliers/${id}`);
  },
};

export const api = {
    supplier,
    // ... other entities can be added here e.g. auth, bookings
};

export default axiosInstance;
