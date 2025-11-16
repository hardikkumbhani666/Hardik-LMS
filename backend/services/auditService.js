import AuditLog from '../models/AuditLog.js';

/**
 * Create audit log entry
 * @param {Object} auditData - Audit data
 * @returns {Promise<AuditLog>}
 */
export const createAuditLog = async (auditData) => {
  const {
    action,
    entityType,
    entityId,
    userId,
    changes = {},
    ipAddress = null,
    userAgent = null,
  } = auditData;

  const auditLog = new AuditLog({
    action,
    entityType,
    entityId,
    userId,
    changes,
    ipAddress,
    userAgent,
  });

  return await auditLog.save();
};

/**
 * Get audit logs with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
export const getAuditLogs = async (filters = {}) => {
  const {
    userId,
    entityType,
    entityId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = filters;

  const query = {};

  if (userId) query.userId = userId;
  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;
  // Support partial action matching (e.g., "approved" matches "leave_approved", "user_approved")
  if (action) {
    query.action = { $regex: action, $options: 'i' };
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      // Set start of day for startDate
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      // Set end of day for endDate
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(query);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

