import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  handleValidationErrors
];

// Field validation rules
export const validateField = [
  body('name').trim().isLength({ min: 1 }).withMessage('Field name is required'),
  body('coordinates').isArray().withMessage('Coordinates must be an array'),
  body('coordinates.*').isNumeric().withMessage('Coordinates must be numbers'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('soilType').trim().isLength({ min: 1 }).withMessage('Soil type is required'),
  handleValidationErrors
];

// Crop validation rules
export const validateCrop = [
  body('cropName').trim().isLength({ min: 1 }).withMessage('Crop name is required'),
  body('sowingDate').isISO8601().withMessage('Invalid sowing date'),
  body('expectedHarvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('area').isNumeric().withMessage('Area must be a number'),
  handleValidationErrors
];

// Weather validation rules
export const validateWeatherRequest = [
  body('fieldId').isMongoId().withMessage('Invalid field ID'),
  handleValidationErrors
];

// Community post validation rules
export const validatePost = [
  body('text').trim().isLength({ min: 1 }).withMessage('Post text is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

// Comment validation rules
export const validateComment = [
  body('text').trim().isLength({ min: 1 }).withMessage('Comment text is required'),
  handleValidationErrors
];
