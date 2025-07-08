import cron from 'node-cron';
import Field from '../models/Field.js';
import weatherService from '../services/weather.service.js';
import cropNotificationService from '../services/cropNotification.service.js';
import CropRecord from '../models/Crop.js';

// Weather update cron job - runs every 1 hour
cron.schedule('0 * * * *', async () => {
  console.log('Running weather update cron job...');
  
  try {
    const fields = await Field.find({});
    
    for (const field of fields) {
      const [lat, lon] = field.location.coordinates.reverse();
      const currentWeather = await weatherService.getCurrentWeather(lat, lon);
      const alerts = weatherService.generateWeatherAlerts(currentWeather, field);
      
      // Save new weather data
      const Weather = await import('../models/Weather.js').then(module => module.default);
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
    
    console.log(`Weather data updated for ${fields.length} fields`);
  } catch (error) {
    console.error('Weather update cron job failed:', error);
  }
});

// Crop notifications cron job - runs every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running crop notifications check...');
  
  try {
    const taskNotifications = await cropNotificationService.checkTaskNotifications();
    const stageNotifications = await cropNotificationService.checkGrowthStageNotifications();
    const harvestNotifications = await cropNotificationService.checkHarvestNotifications();

    const allNotifications = [...taskNotifications, ...stageNotifications, ...harvestNotifications];

    // Send notifications
    for (const notification of allNotifications) {
      await cropNotificationService.sendNotification(notification);
    }

    console.log(`Sent ${allNotifications.length} crop notifications`);
  } catch (error) {
    console.error('Error in crop notifications cron job:', error);
  }
});

// Task overdue check - runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running task overdue check...');
  
  try {
    // Update overdue tasks
    const crops = await CropRecord.find({
      'tasks.status': 'pending',
      'tasks.plannedDate': { $lt: new Date() }
    });

    for (const crop of crops) {
      let updated = false;
      
      crop.tasks.forEach(task => {
        if (task.status === 'pending' && task.plannedDate < new Date()) {
          task.status = 'overdue';
          updated = true;
        }
      });

      if (updated) {
        await crop.save();
      }
    }

    console.log(`Updated ${crops.length} crops with overdue tasks`);
  } catch (error) {
    console.error('Error in task overdue check:', error);
  }
});

console.log('All cron jobs initialized successfully');
