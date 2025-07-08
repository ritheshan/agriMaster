import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getFieldWeather, getFieldWeatherHistory } from '../controllers/weather.controller.js';

const router = express.Router();

router.use(protect);

router.get('/fields/:fieldId/weather', getFieldWeather);
router.get('/fields/:fieldId/weather/history', getFieldWeatherHistory);

export default router;
