import express from 'express'
import { getAuditLogsController } from '../controllers/auditController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get('/', getAuditLogsController)

export default router

