import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validateImageUrlSync } from './imageValidator';

// Validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: errors.array().map(err => err.msg).join(', ')
    });
    return;
  }
  next();
};

// Auth validation rules
export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Trip validation rules
export const validateCreateTrip: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trip name must be between 1 and 100 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL')
    .custom((value) => {
      if (value && !validateImageUrlSync(value)) {
        throw new Error('Cover image must be a valid image URL');
      }
      return true;
    })
];

export const validateUpdateTrip: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trip name must be between 1 and 100 characters'),
  body('startDate')
    .optional()
    .notEmpty()
    .withMessage('Start date cannot be empty'),
  body('endDate')
    .optional()
    .notEmpty()
    .withMessage('End date cannot be empty'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL')
    .custom((value) => {
      if (value && !validateImageUrlSync(value)) {
        throw new Error('Cover image must be a valid image URL');
      }
      return true;
    })
];

// Location validation rules
export const validateCreateLocation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location name must be between 1 and 200 characters'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  body('placeId')
    .trim()
    .notEmpty()
    .withMessage('Place ID is required'),
  body('coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('type')
    .isIn(['restaurant', 'cafe', 'accommodation', 'attraction'])
    .withMessage('Type must be one of: restaurant, cafe, accommodation, attraction'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Phone number must be a valid mobile phone number')
];

export const validateCreateSavedLocation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location name must be between 1 and 200 characters'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  body('placeId')
    .trim()
    .notEmpty()
    .withMessage('Place ID is required'),
  body('coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('type')
    .isIn(['restaurant', 'cafe', 'accommodation', 'attraction'])
    .withMessage('Type must be one of: restaurant, cafe, accommodation, attraction'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Phone number must be a valid mobile phone number')
];

// Custom validation for date range
export const validateDateRange = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.body;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format',
        message: 'Please provide valid start and end dates'
      });
      return;
    }
    
    // Allow same day trips (start and end on same day)
    // Only reject if end date is before start date
    if (end < start) {
      res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: '結束日期不能早於開始日期'
      });
      return;
    }
  }
  
  next();
};
