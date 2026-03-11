const { db } = require('sequelize')

const { AuditLog } = require('../models')

// GET /api/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1
    const limit  = parseInt(req.query.limit) || 20
    const action = req.query.action || ''
    const search = req.query.search || ''

    const offset = (page - 1) * limit

    const whereConditions = {}

    if (action) {
      whereConditions.action = action
    }

    if (search) {
      whereConditions[db.or] = [
        { userName:   { [db.iLike]: `%${search}%` } },
        { entityName: { [db.iLike]: `%${search}%` } },
      ]
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where:  whereConditions,
      limit:  limit,
      offset: offset,
      order:  [['createdAt', 'DESC']],
    })

    return res.json({
      logs: rows,
      pagination: {
        total:      count,
        page:       page,
        limit:      limit,
        totalPages: Math.ceil(count / limit),
      },
    })

  } catch (error) {
    console.error('Audit log fetch error:', error)
    res.status(500).json({ message: 'Failed to fetch audit logs.', error: error.message })
  }
}

module.exports = { getAuditLogs }