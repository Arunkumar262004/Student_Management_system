const { DataTypes } = require('sequelize');
const bcrypt        = require('bcryptjs');

const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type:      DataTypes.STRING,
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },
    password: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type:         DataTypes.ENUM('admin', 'teacher'),
      defaultValue: 'teacher',
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

// Instance method to check password on login
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;