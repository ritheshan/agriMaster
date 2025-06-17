import express from 'express';
import { sendOTP, verifyOTPController , getMe ,  getGoogleAuthURL,
  handleGoogleCallback} from '../controllers/authController.js';
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();
router.get('/me', authMiddleware, getMe);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPController);
router.get('/google/url', getGoogleAuthURL);
router.get('/google/callback', handleGoogleCallback);

export default router;
