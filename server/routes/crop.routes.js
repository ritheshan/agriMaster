import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import {
  addCropsInterested,
  getCropsInterested,
  createCropRecord,
  getCropRecordById,
  getCropCalendar,
  updateGrowthStage,
  addGrowthLog,
  addTask,
  updateTaskStatus,
  getCropNotifications
} from '../controllers/crop.controller.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Crop interests
router.route('/interests')
  .get(getCropsInterested)
  .post(addCropsInterested);

// Crop records
router.route('/records')
  .post(createCropRecord);

router.route('/records/:id')
  .get(getCropRecordById);

// Crop calendar
router.get('/calendar', getCropCalendar);

// Growth stage management
router.put('/records/:id/growth-stage', upload.array('images', 5), updateGrowthStage);

// Growth logs
router.post('/records/:id/growth-log', upload.single('image'), addGrowthLog);

// Task management
router.post('/records/:id/task', addTask);
router.put('/records/:cropId/task/:taskId', updateTaskStatus);

// Notifications
router.get('/notifications', getCropNotifications);

export default router;
