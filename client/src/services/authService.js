import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const authService = {
  // Send OTP to phone number
  sendOtp: async (phoneNumber) => {
    console.log('Sending OTP to:', phoneNumber);
    return await axios.post(`${BASE_URL}/auth/send-otp`, { phoneNumber } , {withCredentials: true  });
  },
  
  // Verify OTP and login
  verifyOtp: async (phoneNumber, otp) => {
    return await axios.post(`${BASE_URL}/auth/verify-otp`, { phoneNumber, otp });
  },
  
  // Register user with complete profile data
  register: async (userData) => {
    return await axios.post(`${BASE_URL}/auth/register`, userData);
  },
  
  // Get current user profile
  getProfile: async () => {
    return await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
  
  // Get Google login URL
  getGoogleAuthUrl: async () => {
    return await axios.get(`${BASE_URL}/auth/google/url`);
  },
  
  // Login with identifier + password
  login: async (identifier, password) => {
    return await axios.post(`${BASE_URL}/auth/login`, { identifier, password });
  },
  
  // Set or update password
  setPassword: async (currentPassword, newPassword) => {
    return await axios.post(`${BASE_URL}/auth/set-password`, { 
      currentPassword, 
      newPassword
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
  
  // Logout user
  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }
};

export default authService;