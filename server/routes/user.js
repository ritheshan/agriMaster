import express from 'express';
import { getCurrentUser } from '../controllers/user.js';
import {  authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCurrentUser);

export default router;
