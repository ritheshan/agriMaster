// server/routes/mlRoutes.js
import express from 'express';
import { predictDisease, getFertilizerRecommendation, predictYield, getBestPlantingTime } from '../controllers/mlController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/predict-disease', protect, predictDisease);
router.post('/fertilizer-recommendation', protect, getFertilizerRecommendation);
router.post('/predict-yield', protect, predictYield);
router.get('/best-planting-time', protect, getBestPlantingTime);

export default router;