import Weather from '../models/Weather.js';
import Field from '../models/Field.js';
import weatherService from '../services/weatherService.js';

export const getFieldWeather = async (req, res) => {
  try {
    const field = await Field.findById(req.params.fieldId);
    
    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found'
      });
    }

    const [lat, lon] = field.location.coordinates.reverse();
    
    // Get current weather and forecast
    const currentWeather = await weatherService.getCurrentWeather(lat, lon);
    const forecast = await weatherService.getForecast(lat, lon);
    
    // Generate alerts and recommendations
    const alerts = weatherService.generateWeatherAlerts(currentWeather, field);
    const recommendations = weatherService.generateRecommendations(currentWeather, field);

    // Save weather data
    const weatherData = new Weather({
      fieldId: field._id,
      date: new Date(),
      temperature: {
        current: currentWeather.main.temp,
        min: currentWeather.main.temp_min,
        max: currentWeather.main.temp_max,
        feelsLike: currentWeather.main.feels_like
      },
      humidity: currentWeather.main.humidity,
      rainfall: currentWeather.rain ? currentWeather.rain['1h'] : 0,
      windSpeed: currentWeather.wind.speed,
      weatherCondition: currentWeather.weather[0].main,
      alerts
    });

    await weatherData.save();

    res.json({
      success: true,
      data: {
        currentWeather: weatherData,
        forecast: forecast.list.slice(0, 5), // Next 15 hours
        alerts,
        recommendations
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getFieldWeatherHistory = async (req, res) => {
  try {
    const history = await Weather.find({
      fieldId: req.params.fieldId,
      date: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }).sort('date');

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
