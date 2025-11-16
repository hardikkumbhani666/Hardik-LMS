import express from 'express';
import {
  createLeave,
  getLeaves,
  getLeave,
  updateLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
  overrideLeave,
  bulkApprove,
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { validateLeaveRequest, validateApproval } from '../middleware/validator.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', uploadSingle, validateLeaveRequest, createLeave);
router.get('/', getLeaves);
router.get('/:id', getLeave);
router.put('/:id', updateLeave);
router.delete('/:id', cancelLeave);

// Manager and HR routes
router.post('/bulk-approve', requireRole('manager', 'hr'), validateApproval, bulkApprove);
router.post('/:id/approve', requireRole('manager', 'hr'), validateApproval, approveLeave);
router.post('/:id/reject', requireRole('manager', 'hr'), validateApproval, rejectLeave);

// HR only routes
router.put('/:id/override', requireRole('hr'), validateApproval, overrideLeave);

export default router;

