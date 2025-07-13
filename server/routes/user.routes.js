import express from 'express';
import { getCurrentUser } from '../controllers/user.controller.js';
import {  authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCurrentUser);

export default router;
