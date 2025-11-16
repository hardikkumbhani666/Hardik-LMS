/**
 * Get user-friendly error messages based on role and error type
 * @param {Error} error - The error object
 * @param {string} role - User role (employee, manager, hr)
 * @param {string} context - Context of the error (e.g., 'applyLeave', 'approveLeave', 'updateBalance')
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, role = 'employee', context = '') => {
  // Handle network errors
  if (!error.response) {
    if (error.request) {
      return 'Unable to connect to server. Please check your internet connection and try again.'
    }
    return 'Something went wrong. Please try again later.'
  }

  const status = error.response.status
  const data = error.response.data
  const errorMessage = data?.message || ''
  const errorType = data?.errorType || ''

  // Handle specific error types first
  if (errorType) {
    switch (errorType) {
      case 'INSUFFICIENT_BALANCE':
        if (role === 'employee') {
          return `You don't have enough ${context || 'leave'} days available. Please check your leave balance.`
        }
        return `Employee doesn't have enough leave days available.`
      
      case 'OVERLAPPING_LEAVE':
        if (role === 'employee') {
          return 'You already have a leave request for these dates. Please choose different dates.'
        }
        return 'Employee already has a leave request for these dates.'
      
      case 'LEAVE_NOT_FOUND':
        if (role === 'employee') {
          return 'Leave request not found. It may have been deleted.'
        }
        return 'Leave request not found.'
      
      case 'UNAUTHORIZED':
        if (role === 'manager') {
          return 'You can only approve leave requests from your team members.'
        }
        if (role === 'employee') {
          return 'You are not authorized to perform this action.'
        }
        return 'You are not authorized to perform this action.'
      
      case 'CONCURRENT_UPDATE':
        if (role === 'employee') {
          return 'This leave request was just updated. Please refresh and try again.'
        }
        return 'Leave request was updated by another user. Please refresh and try again.'
      
      default:
        break
    }
  }

  // Handle by HTTP status code
  switch (status) {
    case 400:
      // Use custom message if available, otherwise provide role-specific message
      if (errorMessage) {
        return errorMessage
      }
      if (role === 'employee' && context === 'applyLeave') {
        return 'Please check your leave dates and try again.'
      }
      if (role === 'manager' && context === 'approveLeave') {
        return 'Unable to process leave request. Please try again.'
      }
      if (role === 'hr' && context === 'updateBalance') {
        return 'Invalid leave balance data. Please check and try again.'
      }
      return 'Invalid information provided. Please check and try again.'
    
    case 401:
      return 'Your session has expired. Please login again.'
    
    case 403:
      if (role === 'employee') {
        return 'You do not have permission to perform this action.'
      }
      if (role === 'manager') {
        return 'You can only manage leave requests from your team members.'
      }
      return 'You do not have permission to perform this action.'
    
    case 404:
      if (role === 'employee' && context === 'editLeave') {
        return 'Leave request not found. It may have been deleted or already processed.'
      }
      if (role === 'manager') {
        return 'Leave request not found. It may have been deleted.'
      }
      if (role === 'hr') {
        return 'Resource not found. Please refresh the page and try again.'
      }
      return 'Requested information not found. Please refresh and try again.'
    
    case 409:
      if (errorMessage.includes('overlapping') || errorMessage.includes('already')) {
        if (role === 'employee') {
          return 'You already have a leave request for these dates. Please choose different dates.'
        }
        return 'Leave request conflicts with existing leave. Please check the dates.'
      }
      return errorMessage || 'This action conflicts with current data. Please refresh and try again.'
    
    case 422:
      if (role === 'employee' && context === 'applyLeave') {
        return 'Please select valid dates. End date must be after start date.'
      }
      return errorMessage || 'Invalid data provided. Please check and try again.'
    
    case 500:
      if (role === 'employee') {
        return 'Server error occurred. Our team has been notified. Please try again later.'
      }
      if (role === 'manager') {
        return 'Server error occurred. Please try again later or contact IT support.'
      }
      if (role === 'hr') {
        return 'Server error occurred. Please contact the system administrator.'
      }
      return 'Server error. Please try again later.'
    
    case 503:
      return 'Service is temporarily unavailable. Please try again in a few moments.'
    
    default:
      // Use custom message if available
      if (errorMessage) {
        // Make error message more user-friendly if it contains technical terms
        let friendlyMessage = errorMessage
        
        // Replace technical terms with user-friendly ones
        friendlyMessage = friendlyMessage.replace(/overlapping/i, 'conflicting dates')
        friendlyMessage = friendlyMessage.replace(/insufficient balance/i, 'not enough leave days')
        friendlyMessage = friendlyMessage.replace(/unauthorized/i, 'not allowed')
        friendlyMessage = friendlyMessage.replace(/not found/i, 'not available')
        
        return friendlyMessage
      }
      
      return 'Something went wrong. Please try again later.'
  }
}

/**
 * Get role-specific action context
 */
export const getActionContext = (role, action) => {
  const contexts = {
    employee: {
      applyLeave: 'applyLeave',
      editLeave: 'editLeave',
      cancelLeave: 'cancelLeave',
      viewLeaves: 'viewLeaves',
    },
    manager: {
      approveLeave: 'approveLeave',
      rejectLeave: 'rejectLeave',
      bulkApprove: 'bulkApprove',
      viewTeamLeaves: 'viewTeamLeaves',
    },
    hr: {
      approveLeave: 'approveLeave',
      rejectLeave: 'rejectLeave',
      updateBalance: 'updateBalance',
      exportReport: 'exportReport',
      viewAllLeaves: 'viewAllLeaves',
    },
  }
  
  return contexts[role]?.[action] || ''
}

