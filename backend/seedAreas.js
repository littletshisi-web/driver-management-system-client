// Run from backend folder: node seedAreas.js
require('dotenv').config();
const { connectDB } = require('./src/config/db');
const Area = require('./src/models/Area');

const areas = [
  // ── Gauteng ──────────────────────────────────────────────────────────────
  { name: 'Bryanston',        city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg North',    zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Morningside',      city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg North',    zoneType: 'Standard', priceModifier: 1.2 },
  { name: 'Hyde Park',        city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg North',    zoneType: 'Standard', priceModifier: 1.2 },
  { name: 'Illovo',           city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg North',    zoneType: 'Standard', priceModifier: 1.2 },
  { name: 'Melrose',          city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg North',    zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Parktown',         city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg Central',  zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Johannesburg CBD', city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg Central',  zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Roodepoort',       city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg West',     zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Krugersdorp',      city: 'Krugersdorp',  province: 'Gauteng', region: 'West Rand',             zoneType: 'Extended', priceModifier: 1.1 },
  { name: 'Randpark Ridge',   city: 'Johannesburg', province: 'Gauteng', region: 'Johannesburg West',     zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Boksburg',         city: 'Boksburg',     province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Benoni',           city: 'Benoni',       province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Germiston',        city: 'Germiston',    province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Edenvale',         city: 'Edenvale',     province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Bedfordview',      city: 'Johannesburg', province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Kempton Park',     city: 'Kempton Park', province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Alberton',         city: 'Alberton',     province: 'Gauteng', region: 'East Rand',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Pretoria CBD',     city: 'Pretoria',     province: 'Gauteng', region: 'Pretoria Central',      zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Hatfield',         city: 'Pretoria',     province: 'Gauteng', region: 'Pretoria East',         zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Menlyn',           city: 'Pretoria',     province: 'Gauteng', region: 'Pretoria East',         zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Lynnwood',         city: 'Pretoria',     province: 'Gauteng', region: 'Pretoria East',         zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Arcadia',          city: 'Pretoria',     province: 'Gauteng', region: 'Pretoria Central',      zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Vereeniging',      city: 'Vereeniging',  province: 'Gauteng', region: 'Vaal Triangle',         zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Vanderbijlpark',   city: 'Vanderbijlpark',province: 'Gauteng',region: 'Vaal Triangle',         zoneType: 'Extended', priceModifier: 1.2 },
  // ── Western Cape ─────────────────────────────────────────────────────────
  { name: 'Cape Town CBD',    city: 'Cape Town',    province: 'Western Cape', region: 'Cape Town Central', zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Camps Bay',        city: 'Cape Town',    province: 'Western Cape', region: 'Atlantic Seaboard', zoneType: 'Standard', priceModifier: 1.3 },
  { name: 'Sea Point',        city: 'Cape Town',    province: 'Western Cape', region: 'Atlantic Seaboard', zoneType: 'Standard', priceModifier: 1.2 },
  { name: 'Bellville',        city: 'Cape Town',    province: 'Western Cape', region: 'Cape Town North',   zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Stellenbosch',     city: 'Stellenbosch', province: 'Western Cape', region: 'Winelands',         zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Paarl',            city: 'Paarl',        province: 'Western Cape', region: 'Winelands',         zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'George',           city: 'George',       province: 'Western Cape', region: 'Garden Route',      zoneType: 'Remote',   priceModifier: 1.4 },
  { name: 'Knysna',           city: 'Knysna',       province: 'Western Cape', region: 'Garden Route',      zoneType: 'Remote',   priceModifier: 1.5 },
  { name: 'Constantia',       city: 'Cape Town',    province: 'Western Cape', region: 'Cape Town South',   zoneType: 'Standard', priceModifier: 1.2 },
  { name: 'Claremont',        city: 'Cape Town',    province: 'Western Cape', region: 'Cape Town South',   zoneType: 'Standard', priceModifier: 1.1 },
  // ── KwaZulu-Natal ─────────────────────────────────────────────────────────
  { name: 'Durban CBD',       city: 'Durban',       province: 'KwaZulu-Natal', region: 'Durban Central',  zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Umhlanga',         city: 'Durban',       province: 'KwaZulu-Natal', region: 'Durban North',    zoneType: 'Standard', priceModifier: 1.2 },
  { name: 'Ballito',          city: 'Ballito',      province: 'KwaZulu-Natal', region: 'North Coast',     zoneType: 'Extended', priceModifier: 1.3 },
  { name: 'Pinetown',         city: 'Durban',       province: 'KwaZulu-Natal', region: 'Durban West',     zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Westville',        city: 'Durban',       province: 'KwaZulu-Natal', region: 'Durban West',     zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Pietermaritzburg', city: 'Pietermaritzburg', province: 'KwaZulu-Natal', region: 'Midlands',    zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Richards Bay',     city: 'Richards Bay', province: 'KwaZulu-Natal', region: 'North Coast',     zoneType: 'Remote',   priceModifier: 1.4 },
  // ── Eastern Cape ──────────────────────────────────────────────────────────
  { name: 'Port Elizabeth',   city: 'Gqeberha',     province: 'Eastern Cape', region: 'Nelson Mandela Bay', zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Summerstrand',     city: 'Gqeberha',     province: 'Eastern Cape', region: 'Nelson Mandela Bay', zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'East London',      city: 'East London',  province: 'Eastern Cape', region: 'Buffalo City',       zoneType: 'Standard', priceModifier: 1.1 },
  { name: 'Mthatha',          city: 'Mthatha',      province: 'Eastern Cape', region: 'OR Tambo',           zoneType: 'Remote',   priceModifier: 1.4 },
  // ── Free State ────────────────────────────────────────────────────────────
  { name: 'Bloemfontein',     city: 'Bloemfontein', province: 'Free State', region: 'Mangaung',             zoneType: 'Standard', priceModifier: 1.0 },
  { name: 'Welkom',           city: 'Welkom',       province: 'Free State', region: 'Goldfields',           zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Bethlehem',        city: 'Bethlehem',    province: 'Free State', region: 'Thabo Mofutsanyana',   zoneType: 'Remote',   priceModifier: 1.3 },
  // ── Limpopo ───────────────────────────────────────────────────────────────
  { name: 'Polokwane',        city: 'Polokwane',    province: 'Limpopo', region: 'Capricorn',               zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Tzaneen',          city: 'Tzaneen',      province: 'Limpopo', region: 'Mopani',                  zoneType: 'Remote',   priceModifier: 1.4 },
  { name: 'Phalaborwa',       city: 'Phalaborwa',   province: 'Limpopo', region: 'Mopani',                  zoneType: 'Remote',   priceModifier: 1.5 },
  // ── Mpumalanga ────────────────────────────────────────────────────────────
  { name: 'Nelspruit',        city: 'Mbombela',     province: 'Mpumalanga', region: 'Ehlanzeni',            zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Witbank',          city: 'eMalahleni',   province: 'Mpumalanga', region: 'Nkangala',             zoneType: 'Extended', priceModifier: 1.1 },
  { name: 'Secunda',          city: 'Secunda',      province: 'Mpumalanga', region: 'Gert Sibande',         zoneType: 'Extended', priceModifier: 1.2 },
  // ── North West ────────────────────────────────────────────────────────────
  { name: 'Rustenburg',       city: 'Rustenburg',   province: 'North West', region: 'Bojanala',             zoneType: 'Extended', priceModifier: 1.2 },
  { name: 'Mahikeng',         city: 'Mahikeng',     province: 'North West', region: 'Ngaka Modiri Molema',  zoneType: 'Remote',   priceModifier: 1.3 },
  { name: 'Potchefstroom',    city: 'Potchefstroom',province: 'North West', region: 'Dr Kenneth Kaunda',    zoneType: 'Extended', priceModifier: 1.1 },
  // ── Northern Cape ─────────────────────────────────────────────────────────
  { name: 'Kimberley',        city: 'Kimberley',    province: 'Northern Cape', region: 'Frances Baard',     zoneType: 'Remote',   priceModifier: 1.3 },
  { name: 'Upington',         city: 'Upington',     province: 'Northern Cape', region: 'ZF Mgcawu',         zoneType: 'Remote',   priceModifier: 1.5 },
];

(async () => {
  await connectDB();
  let inserted = 0;
  let skipped  = 0;
  for (const a of areas) {
    try {
      await Area.create({ ...a, isActive: true });
      console.log('✓', a.name);
      inserted++;
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        console.log('⊘ skip (exists):', a.name);
        skipped++;
      } else {
        console.error('✗', a.name, e.message);
      }
    }
  }
  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped`);
  process.exit();
})();