import express from 'express';
import { sendOTP, verifyOTPController , getMe} from '../controllers/authController.js';
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();
router.get('/me', authMiddleware, getMe);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPController);

export default router;
