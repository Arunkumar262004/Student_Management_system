const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    userId: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    userName: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    userRole: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type:      DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'IMPORT'),
      allowNull: false,
    },
    entityType: {
      type:         DataTypes.STRING,
      allowNull:    false,
      defaultValue: 'Student',
    },
    entityId: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    entityName: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    changes: {
      type:      DataTypes.JSONB,
      allowNull: true,
    },
    ipAddress: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    updatedAt:  false,
  }
);

module.exports = AuditLog;