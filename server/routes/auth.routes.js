import express from 'express';
import { sendOtp, verifyOtp, register, login, setPassword, getMe, getGoogleAuthURL,
  handleGoogleCallback, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { corsMiddleware } from '../middleware/cors.middleware.js';
import cors from 'cors';

// Special CORS configuration just for auth routes
const authCors = cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});

const router = express.Router();
router.get('/me', authMiddleware, getMe);

// Apply special CORS handling to the problematic route
router.options('/send-otp', authCors, (req, res) => {
  res.status(200).end();
});
router.post('/send-otp', corsMiddleware, authCors, sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/register', register);
router.post('/set-password', authMiddleware, setPassword);
router.post('/logout', authMiddleware, logout);
router.get('/google/url', getGoogleAuthURL);
router.get('/google/callback', handleGoogleCallback);

export default router;
