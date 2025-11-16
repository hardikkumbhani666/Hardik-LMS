import { asyncHandler } from '../middleware/errorHandler.js'
import { getAuditLogs } from '../services/auditService.js'

/**
 * @desc    Get audit logs
 * @route   GET /api/audit
 * @access  Private (HR, Manager, Employee - own logs)
 */
export const getAuditLogsController = asyncHandler(async (req, res) => {
  const {
    entityType,
    entityId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = req.query

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
  }

  // Employees can only see their own audit logs
  if (req.user.role === 'employee') {
    filters.userId = req.user._id
  } else if (req.user.role === 'manager') {
    // Managers can see their team's audit logs
    // For now, allow managers to see all (can be filtered by entityId)
  }

  if (entityType) filters.entityType = entityType
  if (entityId) filters.entityId = entityId
  if (action) filters.action = action
  if (startDate) filters.startDate = startDate
  if (endDate) filters.endDate = endDate

  const result = await getAuditLogs(filters)

  res.json({
    success: true,
    data: result,
  })
})

