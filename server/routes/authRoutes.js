import express from 'express';
import { sendOtp, verifyOtp , getMe ,  getGoogleAuthURL,
  handleGoogleCallback} from '../controllers/auth.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const router = express.Router();
router.get('/me', authMiddleware, getMe);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/google/url', getGoogleAuthURL);
router.get('/google/callback', handleGoogleCallback);

export default router;
