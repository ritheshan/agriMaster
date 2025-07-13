import api from './api';

export const calculatorService = {
  calculateProfit: async (calculationData) => {
    return await api.post('/calculator', calculationData);
  },
  
  getMarketPrices: async (cropType) => {
    return await api.get('/calculator/market-prices', { params: { cropType } });
  },
  
  saveCalculation: async (calculation) => {
    return await api.post('/calculator/save', calculation);
  },
  
  getPreviousCalculations: async () => {
    return await api.get('/calculator/history');
  }
};

export default calculatorService;
