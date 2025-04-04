import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import {
  createField,
  getFields,
  getField,
  updateField,
  addHealthRecord,
  getNearbyFields
} from '../controllers/field.controller.js';utes/fieldRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  createField,
  getFields,
  getField,
  updateField,
  addHealthRecord,
  getNearbyFields
} from '../controllers/fieldController.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
  .post(createField)
  .get(getFields);

router.get('/nearby', getNearbyFields);

router.route('/:id')
  .get(getField)
  .put(updateField);

router.post('/:id/health', upload.array('images', 5), addHealthRecord);

export default router;