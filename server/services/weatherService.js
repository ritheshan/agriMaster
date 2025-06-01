import axios from 'axios';
import Weather from '../models/Weather.js';
import Field from '../models/Field.js';

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  async getForecast(lat, lon) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  generateWeatherAlerts(weatherData, field) {
    const alerts = [];

    // Temperature-based alerts
    if (weatherData.main.temp > 35) {
      alerts.push({
        type: 'HEAT',
        severity: 'HIGH',
        message: 'High temperature alert. Consider additional irrigation.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedFields: [field._id]
      });
    }

    // Rainfall alerts
    if (weatherData.rain && weatherData.rain['1h'] > 10) {
      alerts.push({
        type: 'RAIN',
        severity: 'MODERATE',
        message: 'Heavy rainfall expected. Check field drainage.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
        affectedFields: [field._id]
      });
    }

    // Pest risk alerts based on weather conditions
    if (weatherData.main.humidity > 80 && weatherData.main.temp > 25) {
      alerts.push({
        type: 'PEST_RISK',
        severity: 'HIGH',
        message: 'High pest risk conditions. Monitor crops closely.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedFields: [field._id]
      });
    }

    return alerts;
  }

  generateRecommendations(weatherData, field) {
    const recommendations = [];

    // Irrigation recommendations
    if (weatherData.main.temp > 30 && weatherData.main.humidity < 50) {
      recommendations.push({
        type: 'IRRIGATION',
        message: 'Increase irrigation frequency due to high temperature and low humidity.'
      });
    }

    // Pest control recommendations
    if (weatherData.main.humidity > 75 && weatherData.main.temp > 22) {
      recommendations.push({
        type: 'PEST_CONTROL',
        message: 'Conditions favorable for pest growth. Consider preventive measures.'
      });
    }

    // Crop protection recommendations
    if (weatherData.wind.speed > 20) {
      recommendations.push({
        type: 'CROP_PROTECTION',
        message: 'Strong winds expected. Consider wind protection measures.'
      });
    }

    return recommendations;
  }
}

export default new WeatherService();
