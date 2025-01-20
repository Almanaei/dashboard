import { body, param, query, validationResult } from 'express-validator';

// Middleware to check for validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Project validation rules
export const projectValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Project name must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['planning', 'in_progress', 'completed', 'on_hold'])
      .withMessage('Invalid status value'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority value'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format')
      .custom(date => {
        if (date && new Date(date) < new Date()) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format')
      .custom((endDate, { req }) => {
        if (endDate && req.body.startDate) {
          const start = new Date(req.body.startDate);
          const end = new Date(endDate);
          if (end < start) {
            throw new Error('End date must be after start date');
          }
          // Validate project duration is not more than 5 years
          const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
          if (end - start > fiveYears) {
            throw new Error('Project duration cannot exceed 5 years');
          }
        }
        return true;
      }),
    body('budget')
      .optional()
      .isFloat({ min: 0, max: 1000000000 })
      .withMessage('Budget must be between 0 and 1,000,000,000')
      .custom((value) => {
        if (value && !Number.isInteger(value * 100)) {
          throw new Error('Budget can have at most 2 decimal places');
        }
        return true;
      }),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags && tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        if (tags && !tags.every(tag => typeof tag === 'string' && tag.length <= 20)) {
          throw new Error('Each tag must be a string with maximum 20 characters');
        }
        return true;
      }),
    validateRequest
  ],

  update: [
    param('id')
      .isUUID(4)
      .withMessage('Invalid project ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Project name must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['planning', 'in_progress', 'completed', 'on_hold'])
      .withMessage('Invalid status value'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority value'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format')
      .custom((endDate, { req }) => {
        if (endDate && req.body.startDate) {
          const start = new Date(req.body.startDate);
          const end = new Date(endDate);
          if (end < start) {
            throw new Error('End date must be after start date');
          }
          const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
          if (end - start > fiveYears) {
            throw new Error('Project duration cannot exceed 5 years');
          }
        }
        return true;
      }),
    validateRequest
  ],

  delete: [
    param('id')
      .isUUID(4)
      .withMessage('Invalid project ID'),
    validateRequest
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search term must be at least 2 characters'),
    query('status')
      .optional()
      .isIn(['planning', 'in_progress', 'completed', 'on_hold'])
      .withMessage('Invalid status value'),
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority value'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    query('sortBy')
      .optional()
      .isIn(['name', 'status', 'priority', 'startDate', 'endDate', 'createdAt'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validateRequest
  ]
};
