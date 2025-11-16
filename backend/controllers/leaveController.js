import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { calculateTotalDays } from '../utils/calculateDays.js';
import {
  checkOverlap,
  checkBalance,
  getUserManager,
} from '../services/leaveService.js';
import { createAuditLog } from '../services/auditService.js';

/**
 * @desc    Create leave request
 * @route   POST /api/leaves
 * @access  Private (Employee)
 */
export const createLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, reason } = req.body;
  const userId = req.user._id;
  const attachment = req.file ? `/uploads/${req.file.filename}` : null;

  // Calculate total days (using calendar days for now, can be configured)
  const totalDays = calculateTotalDays(startDate, endDate, false);

  // Check for overlapping leaves (ATOMIC)
  const hasOverlap = await checkOverlap(userId, startDate, endDate);
  if (hasOverlap) {
    return res.status(400).json({
      success: false,
      message: 'You already have leave for these dates',
    });
  }

  // Check leave balance (except for unpaid)
  if (type !== 'unpaid') {
    const balanceCheck = await checkBalance(userId, type, totalDays);
    if (!balanceCheck.hasBalance) {
      return res.status(400).json({
        success: false,
        message: `Not enough ${type} leave days. You have ${balanceCheck.balance} days, need ${totalDays} days`,
      });
    }
  }

  // Check for duplicate pending request for same dates
  const duplicateCheck = await LeaveRequest.findOne({
    userId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    status: 'pending',
  });

  if (duplicateCheck) {
    return res.status(400).json({
      success: false,
      message: 'You already have a pending request for these dates',
    });
  }

  // Get manager ID
  const managerId = await getUserManager(userId);

  // Create leave request
  const leaveRequest = new LeaveRequest({
    userId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type,
    reason,
    totalDays,
    managerId,
    status: 'pending',
    attachment,
  });

  // Add audit entry
  leaveRequest.addAuditEntry('created', userId, {
    startDate,
    endDate,
    type,
    totalDays,
  });

  await leaveRequest.save();

  // Create audit log
  await createAuditLog({
    action: 'leave_created',
    entityType: 'LeaveRequest',
    entityId: leaveRequest._id,
    userId,
    changes: { startDate, endDate, type, totalDays },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Populate user details
  await leaveRequest.populate('userId', 'name email employeeId');
  await leaveRequest.populate('managerId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Leave request created successfully',
    data: { leaveRequest },
  });
});

/**
 * @desc    Get leave requests
 * @route   GET /api/leaves
 * @access  Private
 */
export const getLeaves = asyncHandler(async (req, res) => {
  const { status, type, startDate, endDate, userId, page = 1, limit = 10 } = req.query;
  const query = {};

  // Role-based filtering
  if (req.user.role === 'employee') {
    query.userId = req.user._id;
  } else if (req.user.role === 'manager') {
    // Managers see their team members' leaves
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id);
    query.userId = { $in: teamMemberIds };
  }
  // HR can see all leaves (no filter)

  // Apply filters
  if (status) query.status = status;
  if (type) query.type = type;
  if (userId && (req.user.role === 'hr' || req.user.role === 'manager')) {
    query.userId = userId;
  }
  if (startDate || endDate) {
    query.$or = [];
    if (startDate) {
      query.$or.push({ startDate: { $gte: new Date(startDate) } });
    }
    if (endDate) {
      query.$or.push({ endDate: { $lte: new Date(endDate) } });
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const leaves = await LeaveRequest.find(query)
    .populate('userId', 'name email employeeId department')
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await LeaveRequest.countDocuments(query);

  res.json({
    success: true,
    count: leaves.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: { leaves },
  });
});

/**
 * @desc    Get single leave request
 * @route   GET /api/leaves/:id
 * @access  Private
 */
export const getLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const leaveRequest = await LeaveRequest.findById(id)
    .populate('userId', 'name email employeeId department')
    .populate('managerId', 'name email');

  if (!leaveRequest) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  // Check access: employee can only see their own, manager can see team, HR can see all
  if (req.user.role === 'employee' && leaveRequest.userId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  if (req.user.role === 'manager') {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id.toString());
    if (!teamMemberIds.includes(leaveRequest.userId._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
  }

  res.json({
    success: true,
    data: { leaveRequest },
  });
});

/**
 * @desc    Update leave request (only pending)
 * @route   PUT /api/leaves/:id
 * @access  Private (Employee - own leaves only)
 */
export const updateLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, type, reason } = req.body;

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  // Check ownership
  if (leaveRequest.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own leave requests',
    });
  }

  // Check if pending
  if (leaveRequest.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending leave requests can be updated',
    });
  }

  // Update fields
  const updateData = {};
  if (startDate) updateData.startDate = new Date(startDate);
  if (endDate) updateData.endDate = new Date(endDate);
  if (type) updateData.type = type;
  if (reason) updateData.reason = reason;

  // Recalculate total days if dates changed
  if (startDate || endDate) {
    const finalStartDate = updateData.startDate || leaveRequest.startDate;
    const finalEndDate = updateData.endDate || leaveRequest.endDate;
    updateData.totalDays = calculateTotalDays(finalStartDate, finalEndDate, false);
  }

  // Check for overlap if dates changed
  if (startDate || endDate) {
    const finalStartDate = updateData.startDate || leaveRequest.startDate;
    const finalEndDate = updateData.endDate || leaveRequest.endDate;
    const hasOverlap = await checkOverlap(req.user._id, finalStartDate, finalEndDate, id);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have leave for these dates',
      });
    }
  }

  // Check balance if type changed or days changed
  if (updateData.type || updateData.totalDays) {
    const finalType = updateData.type || leaveRequest.type;
    const finalDays = updateData.totalDays || leaveRequest.totalDays;
    if (finalType !== 'unpaid') {
      const balanceCheck = await checkBalance(req.user._id, finalType, finalDays);
      if (!balanceCheck.hasBalance) {
        return res.status(400).json({
          success: false,
          message: `Not enough ${finalType} leave days. You have ${balanceCheck.balance} days, need ${finalDays} days`,
        });
      }
    }
  }

  // Update leave request
  Object.assign(leaveRequest, updateData);
  leaveRequest.addAuditEntry('updated', req.user._id, updateData);
  await leaveRequest.save();

  // Create audit log
  await createAuditLog({
    action: 'leave_updated',
    entityType: 'LeaveRequest',
    entityId: leaveRequest._id,
    userId: req.user._id,
    changes: updateData,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  await leaveRequest.populate('userId', 'name email employeeId');
  await leaveRequest.populate('managerId', 'name email');

  res.json({
    success: true,
    message: 'Leave request updated successfully',
    data: { leaveRequest },
  });
});

/**
 * @desc    Cancel leave request (only pending)
 * @route   DELETE /api/leaves/:id
 * @access  Private (Employee - own leaves only)
 */
export const cancelLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  // Check ownership
  if (leaveRequest.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only cancel your own leave requests',
    });
  }

  // Check if pending
  if (leaveRequest.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending leave requests can be cancelled',
    });
  }

  // Update status
  leaveRequest.status = 'cancelled';
  leaveRequest.addAuditEntry('cancelled', req.user._id, {});
  await leaveRequest.save();

  // Create audit log
  await createAuditLog({
    action: 'leave_cancelled',
    entityType: 'LeaveRequest',
    entityId: leaveRequest._id,
    userId: req.user._id,
    changes: {},
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Leave request cancelled successfully',
  });
});

/**
 * @desc    Approve leave request
 * @route   POST /api/leaves/:id/approve
 * @access  Private (Manager, HR)
 */
export const approveLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  // Find leave request with optimistic locking
  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  // Check if already processed
  if (leaveRequest.status !== 'pending') {
    const statusMessages = {
      approved: 'Leave request is already approved',
      rejected: 'Leave request is already rejected',
      cancelled: 'Leave request is already cancelled',
    };
    return res.status(400).json({
      success: false,
      message: statusMessages[leaveRequest.status] || `Leave request is already ${leaveRequest.status}`,
    });
  }

  // Check access: Manager can only approve team members, HR can approve all
  if (req.user.role === 'manager') {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id.toString());
    if (!teamMemberIds.includes(leaveRequest.userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve leaves for your team members',
      });
    }
  }

  // Check for overlap (ATOMIC)
  const hasOverlap = await checkOverlap(
    leaveRequest.userId,
    leaveRequest.startDate,
    leaveRequest.endDate,
    id
  );
  if (hasOverlap) {
    return res.status(400).json({
      success: false,
      message: 'Employee already has leave for these dates',
    });
  }

  // Check balance (if not unpaid) - Get fresh user data
  if (leaveRequest.type !== 'unpaid') {
    const balanceCheck = await checkBalance(
      leaveRequest.userId,
      leaveRequest.type,
      leaveRequest.totalDays
    );
    if (!balanceCheck.hasBalance) {
      return res.status(400).json({
        success: false,
        message: `Not enough leave days. Employee has ${balanceCheck.balance} days available`,
      });
    }
  }

  // Use findOneAndUpdate for atomic update with condition check
  // This ensures we only update if status is still 'pending' (optimistic locking)
  const updateData = {
    status: 'approved',
    $push: {
      auditTrail: {
        action: 'approved',
        by: req.user._id,
        at: new Date(),
        meta: { comment },
      },
    },
  };

  if (req.user.role === 'manager') {
    updateData.managerComment = comment || '';
  } else if (req.user.role === 'hr') {
    updateData.hrComment = comment || '';
  }

  // Atomic update: only update if status is still 'pending'
  const updatedLeave = await LeaveRequest.findOneAndUpdate(
    { _id: id, status: 'pending' }, // Condition ensures atomicity
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedLeave) {
    return res.status(400).json({
      success: false,
      message: 'Leave request status changed. Please refresh and try again.',
    });
  }

  // Deduct balance atomically using findOneAndUpdate with condition
  if (updatedLeave.type !== 'unpaid') {
    const balanceField = `leaveBalances.${updatedLeave.type}`;
    const userUpdate = await User.findOneAndUpdate(
      {
        _id: updatedLeave.userId,
        [balanceField]: { $gte: updatedLeave.totalDays }, // Ensure sufficient balance
      },
      {
        $inc: { [balanceField]: -updatedLeave.totalDays },
      },
      { new: true }
    );

    // If balance update failed, rollback leave status
    if (!userUpdate) {
      // Rollback: revert leave status to pending
      await LeaveRequest.findByIdAndUpdate(id, {
        status: 'pending',
        $pop: { auditTrail: 1 }, // Remove last audit entry
      });
      return res.status(400).json({
        success: false,
        message: 'Not enough leave days available',
      });
    }
  }

  // Create audit log
  await createAuditLog({
    action: 'leave_approved',
    entityType: 'LeaveRequest',
    entityId: updatedLeave._id,
    userId: req.user._id,
    changes: { status: 'approved', comment },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  await updatedLeave.populate('userId', 'name email employeeId');
  await updatedLeave.populate('managerId', 'name email');

  res.json({
    success: true,
    message: 'Leave request approved successfully',
    data: { leaveRequest: updatedLeave },
  });
});

/**
 * @desc    Reject leave request
 * @route   POST /api/leaves/:id/reject
 * @access  Private (Manager, HR)
 */
export const rejectLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  // Check if already processed
  if (leaveRequest.status !== 'pending') {
    const statusMessages = {
      approved: 'Leave request is already approved',
      rejected: 'Leave request is already rejected',
      cancelled: 'Leave request is already cancelled',
    };
    return res.status(400).json({
      success: false,
      message: statusMessages[leaveRequest.status] || `Leave request is already ${leaveRequest.status}`,
    });
  }

  // Check access
  if (req.user.role === 'manager') {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id.toString());
    if (!teamMemberIds.includes(leaveRequest.userId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject leaves for your team members',
      });
    }
  }

  // Update leave request
  leaveRequest.status = 'rejected';
  if (req.user.role === 'manager') {
    leaveRequest.managerComment = comment || '';
  } else if (req.user.role === 'hr') {
    leaveRequest.hrComment = comment || '';
  }
  leaveRequest.addAuditEntry('rejected', req.user._id, { comment });
  await leaveRequest.save();

  // Create audit log
  await createAuditLog({
    action: 'leave_rejected',
    entityType: 'LeaveRequest',
    entityId: leaveRequest._id,
    userId: req.user._id,
    changes: { status: 'rejected', comment },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  await leaveRequest.populate('userId', 'name email employeeId');
  await leaveRequest.populate('managerId', 'name email');

  res.json({
    success: true,
    message: 'Leave request rejected',
    data: { leaveRequest },
  });
});

/**
 * @desc    HR override leave request
 * @route   PUT /api/leaves/:id/override
 * @access  Private (HR only)
 */
export const overrideLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either approved or rejected',
    });
  }

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  const previousStatus = leaveRequest.status;

  // If changing from approved to rejected, restore balance first
  if (previousStatus === 'approved' && status === 'rejected') {
    if (leaveRequest.type !== 'unpaid') {
      const balanceField = `leaveBalances.${leaveRequest.type}`;
      await User.findByIdAndUpdate(
        leaveRequest.userId,
        {
          $inc: { [balanceField]: leaveRequest.totalDays },
        }
      );
    }
  }

  // If changing to approved, check and deduct balance
  if (status === 'approved' && previousStatus !== 'approved') {
    // Check balance first
    if (leaveRequest.type !== 'unpaid') {
      const balanceCheck = await checkBalance(
        leaveRequest.userId,
        leaveRequest.type,
        leaveRequest.totalDays
      );
      if (!balanceCheck.hasBalance) {
        return res.status(400).json({
          success: false,
          message: `Not enough leave days. Employee has ${balanceCheck.balance} days available`,
        });
      }

      // Deduct balance atomically
      const balanceField = `leaveBalances.${leaveRequest.type}`;
      const userUpdate = await User.findOneAndUpdate(
        {
          _id: leaveRequest.userId,
          [balanceField]: { $gte: leaveRequest.totalDays },
        },
        {
          $inc: { [balanceField]: -leaveRequest.totalDays },
        },
        { new: true }
      );

      if (!userUpdate) {
        return res.status(400).json({
          success: false,
          message: 'Not enough leave days available',
        });
      }
    }
  }

  // Update leave request
  const updateData = {
    status,
    hrComment: comment || '',
    $push: {
      auditTrail: {
        action: 'overridden',
        by: req.user._id,
        at: new Date(),
        meta: {
          previousStatus,
          newStatus: status,
          comment,
        },
      },
    },
  };

  const updatedLeave = await LeaveRequest.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  // Create audit log
  await createAuditLog({
    action: 'leave_overridden',
    entityType: 'LeaveRequest',
    entityId: updatedLeave._id,
    userId: req.user._id,
    changes: { previousStatus, newStatus: status, comment },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  await updatedLeave.populate('userId', 'name email employeeId');
  await updatedLeave.populate('managerId', 'name email');

  res.json({
    success: true,
    message: 'Leave request overridden successfully',
    data: { leaveRequest: updatedLeave },
  });
});

/**
 * @desc    Bulk approve leave requests
 * @route   POST /api/leaves/bulk-approve
 * @access  Private (Manager, HR)
 */
export const bulkApprove = asyncHandler(async (req, res) => {
  const { leaveIds, comment } = req.body;

  if (!Array.isArray(leaveIds) || leaveIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of leave IDs',
    });
  }

  const results = {
    approved: [],
    failed: [],
  };

  for (const leaveId of leaveIds) {
    try {
      const leaveRequest = await LeaveRequest.findById(leaveId);
      
      if (!leaveRequest) {
        results.failed.push({ leaveId, reason: 'Leave request not found' });
        continue;
      }

      // Check if already processed
      if (leaveRequest.status !== 'pending') {
        results.failed.push({ leaveId, reason: `Leave is already ${leaveRequest.status}` });
        continue;
      }

      // Check access
      if (req.user.role === 'manager') {
        const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
        const teamMemberIds = teamMembers.map((m) => m._id.toString());
        if (!teamMemberIds.includes(leaveRequest.userId.toString())) {
          results.failed.push({ leaveId, reason: 'Employee is not in your team' });
          continue;
        }
      }

      // Check for overlap
      const hasOverlap = await checkOverlap(
        leaveRequest.userId,
        leaveRequest.startDate,
        leaveRequest.endDate,
        leaveId
      );
      if (hasOverlap) {
        results.failed.push({ leaveId, reason: 'Employee already has leave for these dates' });
        continue;
      }

      // Check balance
      if (leaveRequest.type !== 'unpaid') {
        const balanceCheck = await checkBalance(
          leaveRequest.userId,
          leaveRequest.type,
          leaveRequest.totalDays
        );
        if (!balanceCheck.hasBalance) {
          results.failed.push({ leaveId, reason: 'Not enough leave days available' });
          continue;
        }
      }

      // Approve leave
      const updateData = {
        status: 'approved',
        $push: {
          auditTrail: {
            action: 'approved',
            by: req.user._id,
            at: new Date(),
            meta: { comment },
          },
        },
      };

      if (req.user.role === 'manager') {
        updateData.managerComment = comment || '';
      } else if (req.user.role === 'hr') {
        updateData.hrComment = comment || '';
      }

      const updatedLeave = await LeaveRequest.findOneAndUpdate(
        { _id: leaveId, status: 'pending' },
        updateData,
        { new: true }
      );

      if (!updatedLeave) {
        results.failed.push({ leaveId, reason: 'Leave status was changed by another user' });
        continue;
      }

      // Deduct balance
      if (updatedLeave.type !== 'unpaid') {
        const balanceField = `leaveBalances.${updatedLeave.type}`;
        const userUpdate = await User.findOneAndUpdate(
          {
            _id: updatedLeave.userId,
            [balanceField]: { $gte: updatedLeave.totalDays },
          },
          {
            $inc: { [balanceField]: -updatedLeave.totalDays },
          }
        );

        if (!userUpdate) {
          // Rollback
          await LeaveRequest.findByIdAndUpdate(leaveId, {
            status: 'pending',
            $pop: { auditTrail: 1 },
          });
          results.failed.push({ leaveId, reason: 'Could not update leave balance' });
          continue;
        }
      }

      // Create audit log
      await createAuditLog({
        action: 'leave_approved',
        entityType: 'LeaveRequest',
        entityId: leaveId,
        userId: req.user._id,
        changes: { status: 'approved', comment },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      results.approved.push(leaveId);
    } catch (error) {
      results.failed.push({ leaveId, reason: error.message });
    }
  }

  res.json({
    success: true,
    message: `Processed ${leaveIds.length} leave requests`,
    data: {
      approved: results.approved.length,
      failed: results.failed.length,
      details: results,
    },
  });
});

