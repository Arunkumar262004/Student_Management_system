const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Student = sequelize.define(
  'Student',
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    firstName: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type:      DataTypes.STRING,
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },
    phone: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type:      DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    className: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    rollNumber: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    parentName: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    parentPhone: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type:         DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Student;