import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getFieldWeather, getFieldWeatherHistory } from '../controllers/weatherController.js';

const router = express.Router();

router.use(protect);

router.get('/fields/:fieldId/weather', getFieldWeather);
router.get('/fields/:fieldId/weather/history', getFieldWeatherHistory);

export default router;
