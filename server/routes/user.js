import express from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getCurrentUser);

export default router;
