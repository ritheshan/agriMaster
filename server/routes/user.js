import express from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getCurrentUser);

export default router;
