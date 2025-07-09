import api from './api';

export const cropService = {
  getAllCrops: async () => {
    return await api.get('/crop');
  },
  
  getCropById: async (id) => {
    return await api.get(`/crop/${id}`);
  },
  
  addCrop: async (cropData) => {
    return await api.post('/crop', cropData);
  },
  
  updateCrop: async (id, cropData) => {
    return await api.put(`/crop/${id}`, cropData);
  },
  
  deleteCrop: async (id) => {
    return await api.delete(`/crop/${id}`);
  },
  
  getRecommendations: async (location) => {
    return await api.get('/crop/recommendations', { params: { location } });
  }
};

export default cropService;
