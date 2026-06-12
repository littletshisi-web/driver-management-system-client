// src/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role:     { type: DataTypes.ENUM('admin', 'manager', 'viewer'), defaultValue: 'viewer' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin:{ type: DataTypes.DATE },
}, {
  hooks: {
    beforeCreate: async (user) => { user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => { if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12); },
  },
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;
