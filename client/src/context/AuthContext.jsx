import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import api from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext(null);

// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Function to check authentication status
  const checkAuthStatus = async () => {
    // Try to get token from cookie first (HttpOnly cookies from backend)
    const cookieToken = getCookie('token');
    // Fallback to localStorage
    const localToken = localStorage.getItem('token');
    
    const token = cookieToken || localToken;
    
    if (token) {
      try {
        // Verify token validity
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          handleLogout();
          return;
        }
        
        // Save token to localStorage if it came from a cookie
        if (cookieToken && !localToken) {
          localStorage.setItem('token', cookieToken);
        }
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user profile from backend
        try {
          const response = await authService.getProfile();
          if (response.status === 200) {
            setUser(response.data);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
          handleLogout();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        handleLogout();
      }
    }
    
    setIsLoading(false);
  };
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const handleLogin = (token, userData) => {
    // Store token in localStorage as backup
    localStorage.setItem('token', token);
    
    // Set user data
    setUser(userData);
    
    // Set axios authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Navigate to dashboard
    navigate('/dashboard');
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    
    // Clear user state
    setUser(null);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Navigate to home page
    navigate('/');
  };
  
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ user, isLoading, handleLogin, handleLogout, isAuthenticated: !!user, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
