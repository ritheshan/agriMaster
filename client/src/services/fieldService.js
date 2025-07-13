import api from './api';

export const fieldService = {
  getAllFields: async () => {
    return await api.get('/field');
  },
  
  getFieldById: async (id) => {
    return await api.get(`/field/${id}`);
  },
  
  addField: async (fieldData) => {
    return await api.post('/field', fieldData);
  },
  
  updateField: async (id, fieldData) => {
    return await api.put(`/field/${id}`, fieldData);
  },
  
  deleteField: async (id) => {
    return await api.delete(`/field/${id}`);
  },
  
  getNearbyFields: async (lat, lng, radius) => {
    return await api.get('/field/nearby', { params: { lat, lng, radius } });
  }
};

export default fieldService;
