import express from 'express';
import {
  getSummary,
  exportCSV,
  exportPDF,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require authentication and Manager/HR role
router.use(authenticate);
router.use(requireRole('manager', 'hr'));

router.get('/summary', getSummary);
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

export default router;

