import express from 'express';
import {
  getProfile,
  updateProfile,
  getBalance,
  updateBalance,
  getUsers,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes (all authenticated users)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/balance', getBalance);

// HR only routes
router.put('/:userId/balance', requireRole('hr'), updateBalance);

// Manager and HR routes
router.get('/', requireRole('manager', 'hr'), getUsers);

export default router;

