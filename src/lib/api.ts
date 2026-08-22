import axios from 'axios';
import { PropertyInput } from '@/types/property';
import { AnalysisResult } from '@/types/analysis';

const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (url) {
    // If Render injected internal service name like "property-x-backend" without full domain
    if (!url.includes('.') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      url = `https://${url}.onrender.com`;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname) {
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://property-x-backend.onrender.com';
    }
    return `http://${window.location.hostname}:5001`;
  }
  return 'http://localhost:5001';
};

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getApiBaseUrl();
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('property_x_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    if (response.data.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('property_x_token', response.data.data.token);
      localStorage.setItem('property_x_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    currentState?: string;
    currentCity?: string;
  }) => {
    const response = await apiClient.post('/api/auth/register', userData);
    if (response.data.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('property_x_token', response.data.data.token);
      localStorage.setItem('property_x_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },
};

export const locationApi = {
  geocode: async (address: string) => {
    const response = await apiClient.post('/api/location/geocode', { address });
    return response.data;
  },

  reverseGeocode: async (lat: number, lng: number) => {
    const response = await apiClient.post('/api/location/reverse-geocode', { lat, lng });
    return response.data;
  },

  autocomplete: async (query: string) => {
    const response = await apiClient.get('/api/location/autocomplete', { params: { query } });
    return response.data;
  },

  searchCustomAmenity: async (lat: number, lng: number, query: string) => {
    const response = await apiClient.post('/api/location/search-amenities', { lat, lng, query });
    return response.data;
  },

  getLocationIntelligence: async (data: {
    address?: string;
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
    workplaceLocation?: string;
  }) => {
    const response = await apiClient.post('/api/location/intelligence', data);
    return response.data;
  },
};

export const propertyApi = {
  createProperty: async (propertyData: any) => {
    const response = await apiClient.post('/api/properties', propertyData);
    return response.data;
  },

  getProperties: async () => {
    const response = await apiClient.get('/api/properties');
    return response.data;
  },

  getPropertyById: async (id: string) => {
    const response = await apiClient.get(`/api/properties/${id}`);
    return response.data;
  },

  getLocationIntelligence: async (propertyId: string) => {
    const response = await apiClient.get(`/api/properties/${propertyId}/location-intelligence`);
    return response.data;
  },
};

export const analysisApi = {
  analyzeProperty: async (input: PropertyInput): Promise<AnalysisResult> => {
    const response = await apiClient.post('/api/analyses/analyze', input);
    return response.data.data;
  },

  getAnalyses: async () => {
    const response = await apiClient.get('/api/analyses');
    return response.data;
  },

  getAnalysisById: async (id: string) => {
    const response = await apiClient.get(`/api/analyses/${id}`);
    return response.data;
  },
};

export const governmentApi = {
  getGuide: async (params: {
    buyerState?: string;
    buyerCity?: string;
    buyerStatus?: string;
    propertyState?: string;
    propertyCity?: string;
    propertyAddress?: string;
    propertyType?: string;
    purchasePurpose?: string;
  }) => {
    const response = await apiClient.get('/api/government/guide', { params });
    return response.data;
  },
};

export default apiClient;
