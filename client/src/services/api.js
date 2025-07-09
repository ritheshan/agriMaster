import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  // Important for cookies to be sent and received
  withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // First check for token in cookies (HttpOnly cookies from backend)
    const cookieToken = getCookie('token');
    // Fallback to localStorage
    const localToken = localStorage.getItem('token');
    
    const token = cookieToken || localToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle error based on status code
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please log in again.');
          break;
        
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
        
        case 404:
          // Not Found
          toast.error('Resource not found.');
          break;
        
        case 422:
          // Validation Error
          const validationErrors = response.data.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach(error => {
              toast.error(error);
            });
          } else {
            toast.error('Validation failed. Please check your inputs.');
          }
          break;
        
        case 500:
          // Server Error
          toast.error('Server error. Please try again later.');
          break;
        
        default:
          if (response.data && response.data.message) {
            toast.error(response.data.message);
          } else {
            toast.error('Something went wrong. Please try again.');
          }
          break;
      }
    } else {
      // Network error
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
