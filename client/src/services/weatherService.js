import api from './api';

export const weatherService = {
  getCurrentWeather: async (location) => {
    return await api.get('/weather/current', { params: { location } });
  },
  
  getForecast: async (location) => {
    return await api.get('/weather/forecast', { params: { location } });
  },
  
  getAlerts: async (location) => {
    return await api.get('/weather/alerts', { params: { location } });
  }
};

export default weatherService;
