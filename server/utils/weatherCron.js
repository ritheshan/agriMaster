import cron from 'node-cron';
import Field from '../models/Field.js';
import weatherService from '../services/weatherService.js';

// Update weather data every 1 hour
cron.schedule('0 * * * *', async () => {
  try {
    const fields = await Field.find({});
    
    for (const field of fields) {
      const [lat, lon] = field.location.coordinates.reverse();
      const currentWeather = await weatherService.getCurrentWeather(lat, lon);
      const alerts = weatherService.generateWeatherAlerts(currentWeather, field);
      
      // Save new weather data
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
    }
  } catch (error) {
    console.error('Weather update cron job failed:', error);
  }
});
