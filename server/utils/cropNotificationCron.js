import cron from 'node-cron';
import cropNotificationService from '../services/cropNotificationService.js';

// Run crop notifications check every day at 8 AM
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

// Run task overdue check every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running task overdue check...');
  
  try {
    const CropRecord = await import('../models/Crop.js').then(module => module.default);
    
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

console.log('Crop notification cron jobs initialized');
