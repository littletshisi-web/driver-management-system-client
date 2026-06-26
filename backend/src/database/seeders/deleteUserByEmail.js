// src/database/seeders/deleteUserByEmail.js
//
// One-time utility to delete a user by email (e.g. to reset a bad admin password).
// Usage:
//   node src/database/seeders/deleteUserByEmail.js admin@example.com

require('dotenv').config();
const { connectDB, sequelize } = require('../../config/db');
const User = require('../../models/User');

const run = async () => {
  const [, , email] = process.argv;
  if (!email) {
    console.error('Usage: node deleteUserByEmail.js email@example.com');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log(`No user found with email ${email}`);
    await sequelize.close();
    return;
  }

  await user.destroy();
  console.log(`✅ Deleted user ${email} (was role: ${user.role})`);
  await sequelize.close();
};

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});