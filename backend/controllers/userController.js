import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/auditService.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
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
        updatedAt: user.updatedAt,
      },
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, department } = req.body;
  const userId = req.user._id;

  const updateData = {};
  if (name) updateData.name = name;
  if (department) updateData.department = department;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  // Create audit log
  await createAuditLog({
    action: 'user_updated',
    entityType: 'User',
    entityId: userId,
    userId: userId,
    changes: updateData,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * @desc    Get leave balance
 * @route   GET /api/users/balance
 * @access  Private
 */
export const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('leaveBalances');

  res.json({
    success: true,
    data: {
      balances: user.leaveBalances,
    },
  });
});

/**
 * @desc    Update leave balance (HR only)
 * @route   PUT /api/users/:userId/balance
 * @access  Private (HR)
 */
export const updateBalance = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { leaveType, days } = req.body;

  if (!leaveType || days === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Leave type and days are required',
    });
  }

  const validTypes = ['casual', 'sick', 'earned', 'unpaid'];
  if (!validTypes.includes(leaveType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid leave type',
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const oldBalance = user.leaveBalances[leaveType];
  user.leaveBalances[leaveType] = Math.max(0, days);
  await user.save();

  // Create audit log
  await createAuditLog({
    action: 'balance_updated',
    entityType: 'User',
    entityId: userId,
    userId: req.user._id,
    changes: {
      leaveType,
      oldBalance,
      newBalance: user.leaveBalances[leaveType],
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Leave balance updated successfully',
    data: {
      leaveType,
      oldBalance,
      newBalance: user.leaveBalances[leaveType],
    },
  });
});

/**
 * @desc    Get all users (HR/Manager)
 * @route   GET /api/users
 * @access  Private (Manager, HR)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { role, department, search } = req.query;
  const query = { isActive: true };

  // Managers can see:
  // 1. Employees assigned to them (managerId = their ID)
  // 2. Employees without a manager assigned (managerId = null or doesn't exist)
  // This allows managers to see all employees, including newly created ones
  if (req.user.role === 'manager') {
    // Only show employees, not other managers or HR
    query.role = 'employee';
    
    // Show employees with this manager OR employees without a manager
    query.$or = [
      { managerId: req.user._id },
      { managerId: null },
      { managerId: { $exists: false } }
    ];
  } else {
    // HR can filter by role if provided
    if (role) query.role = role;
  }

  // Department filter
  if (department) query.department = department;

  // Search filter - combine with existing $or if present
  if (search) {
    const searchConditions = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];

    if (query.$or) {
      // If there's already an $or (from manager filter), use $and to combine
      query.$and = [
        { $or: query.$or },
        { $or: searchConditions }
      ];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  const users = await User.find(query)
    .select('-password')
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: { users },
  });
});

