import CropRecord from '../models/Crop.js';
import User from '../models/User.js';

class CropNotificationService {
  // Check for tasks due soon
  async checkTaskNotifications() {
    try {
      const crops = await CropRecord.find({
        'tasks.status': 'pending',
        'tasks.notificationSent': false
      }).populate('farmer');

      const notifications = [];

      for (const crop of crops) {
        const taskNotifications = crop.checkTaskNotifications();
        
        for (const task of taskNotifications) {
          notifications.push({
            userId: crop.farmer._id,
            type: 'task_reminder',
            title: `Task Due: ${task.title}`,
            message: `${task.title} is due for ${crop.cropName}`,
            priority: task.priority,
            cropId: crop._id,
            taskId: task._id,
            dueDate: task.plannedDate
          });

          // Mark notification as sent
          task.notificationSent = true;
        }

        if (taskNotifications.length > 0) {
          await crop.save();
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking task notifications:', error);
      return [];
    }
  }

  // Check for growth stage updates needed
  async checkGrowthStageNotifications() {
    try {
      const crops = await CropRecord.find({
        status: 'growing'
      }).populate('farmer');

      const notifications = [];

      for (const crop of crops) {
        const currentStage = crop.growthStages.find(stage => 
          stage.name === crop.currentStage && !stage.completed
        );
        
        if (currentStage) {
          const expectedCompletionDate = new Date(currentStage.startDate);
          expectedCompletionDate.setDate(expectedCompletionDate.getDate() + currentStage.expectedDuration);
          
          const today = new Date();
          const daysDifference = Math.floor((expectedCompletionDate - today) / (1000 * 60 * 60 * 24));
          
          // Notify if stage is overdue or due within 2 days
          if (daysDifference <= 2) {
            notifications.push({
              userId: crop.farmer._id,
              type: 'growth_stage_update',
              title: `Growth Stage Update Required`,
              message: `Please update the ${currentStage.name} stage for ${crop.cropName}`,
              priority: daysDifference < 0 ? 'high' : 'medium',
              cropId: crop._id,
              stageName: currentStage.name
            });
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking growth stage notifications:', error);
      return [];
    }
  }

  // Check for harvest reminders
  async checkHarvestNotifications() {
    try {
      const crops = await CropRecord.find({
        status: 'growing',
        expectedHarvestDate: { $exists: true }
      }).populate('farmer');

      const notifications = [];
      const today = new Date();

      for (const crop of crops) {
        const harvestDate = new Date(crop.expectedHarvestDate);
        const daysDifference = Math.floor((harvestDate - today) / (1000 * 60 * 60 * 24));
        
        // Notify 7 days before harvest
        if (daysDifference === 7) {
          notifications.push({
            userId: crop.farmer._id,
            type: 'harvest_reminder',
            title: `Harvest Approaching`,
            message: `${crop.cropName} is ready for harvest in 7 days`,
            priority: 'medium',
            cropId: crop._id,
            harvestDate: crop.expectedHarvestDate
          });
        }
        
        // Notify if harvest is overdue
        if (daysDifference < 0) {
          notifications.push({
            userId: crop.farmer._id,
            type: 'harvest_overdue',
            title: `Harvest Overdue`,
            message: `${crop.cropName} harvest is overdue by ${Math.abs(daysDifference)} days`,
            priority: 'high',
            cropId: crop._id,
            harvestDate: crop.expectedHarvestDate
          });
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking harvest notifications:', error);
      return [];
    }
  }

  // Get all notifications for a user
  async getAllNotifications(userId) {
    try {
      const taskNotifications = await this.checkTaskNotifications();
      const stageNotifications = await this.checkGrowthStageNotifications();
      const harvestNotifications = await this.checkHarvestNotifications();

      const userNotifications = [
        ...taskNotifications,
        ...stageNotifications,
        ...harvestNotifications
      ].filter(notification => notification.userId.toString() === userId);

      return userNotifications.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return [];
    }
  }

  // Send notification (can be extended to integrate with push notification services)
  async sendNotification(notification) {
    // This can be extended to integrate with:
    // - Push notification services (Firebase, AWS SNS)
    // - Email services
    // - SMS services
    // - WebSocket for real-time notifications
    
    console.log('Sending notification:', notification);
    
    // For now, just log the notification
    // In production, you would integrate with actual notification services
    return true;
  }
}

export default new CropNotificationService();
