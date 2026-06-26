const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Driver = sequelize.define('Driver', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  // ✅ Links this Driver record to the User who logs in (auth table).
  // Nullable because a Driver could theoretically be created by an admin
  // before the person ever registers an account.
  userId:       { type: DataTypes.UUID, allowNull: true, unique: true, references: { model: 'Users', key: 'id' } },
  firstName:    { type: DataTypes.STRING, allowNull: false },
  lastName:     { type: DataTypes.STRING, allowNull: false },
  phone:        { type: DataTypes.STRING, allowNull: false, unique: true },
  email:        { type: DataTypes.STRING, validate: { isEmail: true } },
  idNumber:     { type: DataTypes.STRING },
  dateOfBirth:  { type: DataTypes.DATEONLY },
  zone:         { type: DataTypes.STRING },
  partnerId:    { type: DataTypes.UUID, references: { model: 'Partners', key: 'id' } },
  status:       { type: DataTypes.ENUM('active', 'inactive', 'on-leave', 'suspended'), defaultValue: 'active' },
  rating:       { type: DataTypes.FLOAT, defaultValue: 0 },
  totalTrips:   { type: DataTypes.INTEGER, defaultValue: 0 },
  shiftStart:   { type: DataTypes.STRING },
  shiftEnd:     { type: DataTypes.STRING },
  // Documents
  licenceNumber:      { type: DataTypes.STRING },
  licenceExpiry:      { type: DataTypes.DATEONLY },
  vehicleReg:         { type: DataTypes.STRING },
  vehicleRegExpiry:   { type: DataTypes.DATEONLY },
  insuranceExpiry:    { type: DataTypes.DATEONLY },
  pdpExpiry:          { type: DataTypes.DATEONLY },
  backgroundCleared:  { type: DataTypes.BOOLEAN, defaultValue: false },
  // Avatar / photo
  photoUrl:     { type: DataTypes.STRING },
}, {
  indexes: [{ fields: ['zone'] }, { fields: ['status'] }, { fields: ['partnerId'] }, { fields: ['userId'] }],
});

module.exports = Driver;