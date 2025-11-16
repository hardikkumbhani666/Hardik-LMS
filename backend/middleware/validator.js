import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('role')
    .optional()
    .isIn(['employee', 'manager', 'hr'])
    .withMessage('Invalid role'),
  validate,
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

/**
 * Validation rules for leave request
 */
export const validateLeaveRequest = [
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be greater than or equal to start date');
      }
      return true;
    }),
  body('type')
    .isIn(['casual', 'sick', 'earned', 'unpaid'])
    .withMessage('Invalid leave type'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  validate,
];

/**
 * Validation rules for approval/rejection
 */
export const validateApproval = [
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  validate,
];

