import api from './api';

export const userService = {
  getProfile: async () => {
    return await api.get('/user/profile');
  },
  
  updateProfile: async (userData) => {
    return await api.put('/user/profile', userData);
  },
  
  updatePreferences: async (preferences) => {
    return await api.put('/user/preferences', preferences);
  },
};

export default userService;
