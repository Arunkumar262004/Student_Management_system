const sequelize = require('../config/database');

const User     = require('./User');
const Student  = require('./Student');
const AuditLog = require('./AuditLog');

// Define relationships
User.hasMany(AuditLog,    { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User,  { foreignKey: 'userId', as: 'user'      });

module.exports = { sequelize, User, Student, AuditLog };