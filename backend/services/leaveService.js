import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { calculateTotalDays, dateRangesOverlap } from '../utils/calculateDays.js';
import mongoose from 'mongoose';

/**
 * Check for overlapping approved leaves
 * @param {String} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {String} excludeLeaveId - Leave ID to exclude from check (for updates)
 * @returns {Promise<Boolean>} True if overlap exists
 */
export const checkOverlap = async (userId, startDate, endDate, excludeLeaveId = null) => {
  const query = {
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: ['approved', 'pending'] }, // Check both approved and pending
    $or: [
      // Case 1: New leave starts during existing leave
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      },
      // Case 2: New leave completely covers existing leave
      {
        startDate: { $gte: new Date(startDate) },
        endDate: { $lte: new Date(endDate) },
      },
    ],
  };

  if (excludeLeaveId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeLeaveId) };
  }

  const overlappingLeave = await LeaveRequest.findOne(query);
  return !!overlappingLeave;
};

/**
 * Check if user has sufficient leave balance
 * @param {String} userId - User ID
 * @param {String} leaveType - Leave type
 * @param {Number} totalDays - Total days required
 * @returns {Promise<Object>} { hasBalance: Boolean, balance: Number }
 */
export const checkBalance = async (userId, leaveType, totalDays) => {
  if (leaveType === 'unpaid') {
    return { hasBalance: true, balance: Infinity };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const balance = user.leaveBalances[leaveType] || 0;
  return {
    hasBalance: balance >= totalDays,
    balance,
  };
};

/**
 * Deduct leave balance atomically
 * @param {String} userId - User ID
 * @param {String} leaveType - Leave type
 * @param {Number} totalDays - Days to deduct
 * @param {mongoose.ClientSession} session - MongoDB session for transaction
 * @returns {Promise<void>}
 */
export const deductBalance = async (userId, leaveType, totalDays, session = null) => {
  if (leaveType === 'unpaid') {
    return; // No balance deduction for unpaid leaves
  }

  const update = {
    $inc: { [`leaveBalances.${leaveType}`]: -totalDays },
  };

  if (session) {
    await User.updateOne({ _id: userId }, update, { session });
  } else {
    await User.updateOne({ _id: userId }, update);
  }
};

/**
 * Restore leave balance (when rejecting approved leave)
 * @param {String} userId - User ID
 * @param {String} leaveType - Leave type
 * @param {Number} totalDays - Days to restore
 * @param {mongoose.ClientSession} session - MongoDB session for transaction
 * @returns {Promise<void>}
 */
export const restoreBalance = async (userId, leaveType, totalDays, session = null) => {
  if (leaveType === 'unpaid') {
    return;
  }

  const update = {
    $inc: { [`leaveBalances.${leaveType}`]: totalDays },
  };

  if (session) {
    await User.updateOne({ _id: userId }, update, { session });
  } else {
    await User.updateOne({ _id: userId }, update);
  }
};

/**
 * Get user's manager ID
 * @param {String} userId - User ID
 * @returns {Promise<String|null>} Manager ID or null
 */
export const getUserManager = async (userId) => {
  const user = await User.findById(userId).select('managerId');
  return user?.managerId || null;
};

