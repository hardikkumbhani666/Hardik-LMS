import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { jwtConfig } from '../config/jwt.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/auditService.js';

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name, role, department, managerId } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  // Determine the final role
  const finalRole = role || 'employee';

  // Auto-assign manager for new employees if not provided
  let finalManagerId = managerId || null;
  if (finalRole === 'employee' && !finalManagerId) {
    // Find the first available manager in the system
    const defaultManager = await User.findOne({ role: 'manager', isActive: true });
    if (defaultManager) {
      finalManagerId = defaultManager._id;
    }
  }

  // Create user
  const user = await User.create({
    email,
    password,
    name,
    role: finalRole,
    department,
    managerId: finalManagerId,
  });

  // Generate token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Create audit log
  await createAuditLog({
    action: 'user_created',
    entityType: 'User',
    entityId: user._id,
    userId: user._id,
    changes: { 
      email, 
      name, 
      role: user.role,
      managerId: finalManagerId ? 'Auto-assigned' : null,
      department 
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        leaveBalances: user.leaveBalances,
      },
      token,
      refreshToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this email address. Please check your email or sign up.',
      errorType: 'USER_NOT_FOUND',
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact your HR department for assistance.',
      errorType: 'ACCOUNT_DEACTIVATED',
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please try again or reset your password.',
      errorType: 'INVALID_PASSWORD',
    });
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        leaveBalances: user.leaveBalances,
      },
      token,
      refreshToken,
    },
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    // Generate new access token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        managerId: user.managerId,
        leaveBalances: user.leaveBalances,
        createdAt: user.createdAt,
      },
    },
  });
});

