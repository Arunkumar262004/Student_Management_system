const express = require('express')

const { authenticate, authorize } = require('../middleware/auth')

const auditController = require('../controllers/auditController')

const router = express.Router()

// Admin only — view all audit logs
router.get('/', authenticate, authorize('admin'), auditController.getAuditLogs)

module.exports = router