/**
 * Middleware to check if user has required role(s)
 * @param {Array<String>} allowedRoles - Array of allowed roles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is accessing their own resource or has higher role
 * @param {String} resourceUserId - User ID from resource
 */
export const requireOwnershipOrRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
    const isOwner = resourceUserId && resourceUserId.toString() === req.user._id.toString();
    const hasRole = allowedRoles.includes(req.user.role);

    if (isOwner || hasRole) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources or have required role.',
    });
  };
};

