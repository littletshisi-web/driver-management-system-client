// src/database/seeders/run.js
require('dotenv').config();
const { connectDB, sequelize } = require('../../config/db');
const User    = require('../../models/User');
const Driver  = require('../../models/Driver');
const Partner = require('../../models/Partner');
const Area    = require('../../models/Area');

const seed = async () => {
  await connectDB();

  // Areas
  await Area.bulkCreate([
    { name: 'Sandton',   city: 'Johannesburg', province: 'Gauteng', lat: -26.1076, lng: 28.0567 },
    { name: 'Randburg',  city: 'Johannesburg', province: 'Gauteng', lat: -26.0925, lng: 27.9979 },
    { name: 'Soweto',    city: 'Johannesburg', province: 'Gauteng', lat: -26.2677, lng: 27.8585 },
    { name: 'Midrand',   city: 'Midrand',      province: 'Gauteng', lat: -25.9953, lng: 28.1283 },
    { name: 'Centurion', city: 'Pretoria',     province: 'Gauteng', lat: -25.8600, lng: 28.1890 },
    { name: 'Rosebank',  city: 'Johannesburg', province: 'Gauteng', lat: -26.1460, lng: 28.0438 },
    { name: 'Fourways',  city: 'Johannesburg', province: 'Gauteng', lat: -26.0165, lng: 28.0107 },
  ], { ignoreDuplicates: true });

  // Partners
  const [foodco, quicksend, rushbox] = await Partner.bulkCreate([
    { name: 'FoodCo',    type: 'food',    commissionRate: 12, paymentTerms: 'weekly',  zones: ['Sandton','Soweto','Midrand'],    contactName: 'Sarah Dube',    contactPhone: '+27110001111', contactEmail: 'ops@foodco.co.za' },
    { name: 'QuickSend', type: 'parcels', commissionRate: 10, paymentTerms: 'monthly', zones: ['Randburg','Centurion'],          contactName: 'James Moyo',    contactPhone: '+27110002222', contactEmail: 'ops@quicksend.co.za' },
    { name: 'RushBox',   type: 'grocery', commissionRate: 15, paymentTerms: 'weekly',  zones: ['Midrand','Fourways','Rosebank'], contactName: 'Aisha Patel',   contactPhone: '+27110003333', contactEmail: 'ops@rushbox.co.za' },
  ], { ignoreDuplicates: true });

  // Admin user
  await User.findOrCreate({
    where: { email: 'admin@fleethq.co.za' },
    defaults: { name: 'Admin User', password: 'Admin@1234', role: 'admin' },
  });

  // Drivers
  await Driver.bulkCreate([
    { firstName: 'Thabo',   lastName: 'Nkosi',    phone: '+27821001001', email: 'thabo@fleethq.co.za',   zone: 'Sandton',   partnerId: foodco.id,    status: 'active',   shiftStart: '06:00', shiftEnd: '14:00', rating: 4.9, totalTrips: 847, backgroundCleared: true },
    { firstName: 'Priya',   lastName: 'Govender', phone: '+27821001002', email: 'priya@fleethq.co.za',   zone: 'Randburg',  partnerId: quicksend.id, status: 'active',   shiftStart: '10:00', shiftEnd: '18:00', rating: 4.8, totalTrips: 612, backgroundCleared: true },
    { firstName: 'Sipho',   lastName: 'Dlamini',  phone: '+27821001003', email: 'sipho@fleethq.co.za',   zone: 'Soweto',    partnerId: foodco.id,    status: 'on-leave', shiftStart: '06:00', shiftEnd: '14:00', rating: 4.7, totalTrips: 391, backgroundCleared: true },
    { firstName: 'Amara',   lastName: 'Osei',     phone: '+27821001004', email: 'amara@fleethq.co.za',   zone: 'Midrand',   partnerId: rushbox.id,   status: 'active',   shiftStart: '14:00', shiftEnd: '22:00', rating: 4.6, totalTrips: 529, backgroundCleared: true },
    { firstName: 'Leilani', lastName: 'Mokoena',  phone: '+27821001005', email: 'leilani@fleethq.co.za', zone: 'Centurion', partnerId: quicksend.id, status: 'inactive', rating: 4.5, totalTrips: 204, backgroundCleared: false },
  ], { ignoreDuplicates: true });

  console.log('✅ Seed complete');
  await sequelize.close();
};

seed().catch((err) => { console.error(err); process.exit(1); });
