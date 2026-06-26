// src/database/seeders/createAdmin.js
//
// One-time script to bootstrap the very first admin account.
// Run this once, then delete or guard it — it should never be reachable
// via a public route, since it bypasses the normal role restrictions.
//
// Usage:
//   node src/database/seeders/createAdmin.js "Admin Name" admin@example.com "StrongPass1!"

require('dotenv').config();
const { connectDB, sequelize } = require('../../config/db');
const User = require('../../models/User');

const createAdmin = async () => {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error('Usage: node createAdmin.js "Full Name" email@example.com "Password123!"');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.error(`A user with email ${email} already exists (role: ${existing.role}).`);
    await sequelize.close();
    process.exit(1);
  }

  // ✅ Created directly with role 'admin' and isVerified true —
  // this is the one legitimate place that's allowed, since it's run
  // manually from a trusted machine, not exposed over HTTP.
  const admin = await User.create({
    name,
    email,
    password,
    role: 'admin',
    isVerified: true,
  });

  console.log(`✅ Admin account created: ${admin.email} (id: ${admin.id})`);
  await sequelize.close();
};

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
