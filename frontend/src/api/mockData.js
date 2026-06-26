// ═══════════════════════════════════════════════════════
//  MOCK DATA
//  Used when VITE_USE_MOCK=true in .env.
//  Replace with real API calls as backend delivers endpoints.
// ═══════════════════════════════════════════════════════

export const MOCK_DRIVERS = [];

export const MOCK_PARTNERS = [];

export const MOCK_TASKS = [];

export const MOCK_AREAS = [
  { id: 1, name: 'Johannesburg CBD', region: 'Gauteng', priceModifier: 1.2, zoneType: 'Extended', driverCount: 5 },
  { id: 2, name: 'Sandton',          region: 'Gauteng', priceModifier: 1.3, zoneType: 'Extended', driverCount: 4 },
  { id: 3, name: 'Soweto',           region: 'Gauteng', priceModifier: 1.0, zoneType: 'Standard', driverCount: 3 },
  { id: 4, name: 'East Rand',        region: 'Gauteng', priceModifier: 1.1, zoneType: 'Standard', driverCount: 4 },
  { id: 5, name: 'West Rand',        region: 'Gauteng', priceModifier: 1.1, zoneType: 'Standard', driverCount: 3 },
  { id: 6, name: 'Midrand',          region: 'Gauteng', priceModifier: 1.2, zoneType: 'Extended', driverCount: 2 },
  { id: 7, name: 'Centurion',        region: 'Gauteng', priceModifier: 1.0, zoneType: 'Standard', driverCount: 2 },
  { id: 8, name: 'Roodepoort',       region: 'Gauteng', priceModifier: 1.5, zoneType: 'Remote',   driverCount: 1 },
];

export const MOCK_AUDIT = [
  { id: 1, ts: '2025-05-14 09:32', user: 'Admin',    action: 'driver_assigned',      entity: 'Driver #3', detail: 'Assigned to QuickHaul SA'          },
  { id: 2, ts: '2025-05-14 09:15', user: 'Sarah J.', action: 'task_created',         entity: 'TSK-008',   detail: 'Parcel Delivery — Sandton'          },
  { id: 3, ts: '2025-05-14 08:50', user: 'Admin',    action: 'pricing_updated',      entity: 'Pricing',   detail: 'Towing base fee R650 → R680'        },
  { id: 4, ts: '2025-05-13 17:22', user: 'David P.', action: 'task_status_changed',  entity: 'TSK-006',   detail: 'Status → Completed'                 },
  { id: 5, ts: '2025-05-13 14:05', user: 'Admin',    action: 'driver_suspended',     entity: 'Driver #5', detail: 'Zanele Dube set Inactive'           },
  { id: 6, ts: '2025-05-13 11:30', user: 'Admin',    action: 'partner_created',      entity: 'Partner #3',detail: 'Metro Towing added'                 },
  { id: 7, ts: '2025-05-12 15:10', user: 'Admin',    action: 'driver_assigned',      entity: 'Driver #2', detail: 'Assigned to FastMove Logistics'     },
  { id: 8, ts: '2025-05-12 10:45', user: 'Sarah J.', action: 'task_created',         entity: 'TSK-005',   detail: 'Vehicle Towing — Johannesburg CBD'  },
];

export const MOCK_PRICING = {
  baseFees: { parcel_delivery: 85, vehicle_towing: 650, furniture_moving: 400 },
  ratesPerKm: { parcel_delivery: 4.5, vehicle_towing: 18, furniture_moving: 10 },
  categoryModifiers: { parcel_delivery: 1.0, vehicle_towing: 1.8, furniture_moving: 1.5 },
  defaultCommissionPct: 12,
  premiumCommissionPct: 8,
  newPartnerCommissionPct: 15,
};