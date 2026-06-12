// ═══════════════════════════════════════════════════════
//  MOCK DATA
//  Used when VITE_USE_MOCK=true in .env.
//  Replace with real API calls as backend delivers endpoints.
// ═══════════════════════════════════════════════════════

export const MOCK_DRIVERS = [
  { id: 1, name: 'Lebo Mokoena',   initials: 'LM', licenseNumber: 'GP12345678', vehicleType: 'Van',       vehicleReg: 'GP 123-456', area: { id: 1, name: 'Johannesburg CBD' }, partner: { id: 1, name: 'FastMove Logistics' }, availabilityStatus: 'available', phone: '+27 82 111 0001' },
  { id: 2, name: 'Thabo Nkosi',    initials: 'TN', licenseNumber: 'GP87654321', vehicleType: 'Bakkie',    vehicleReg: 'GP 654-321', area: { id: 2, name: 'Sandton'           }, partner: { id: 1, name: 'FastMove Logistics' }, availabilityStatus: 'busy',      phone: '+27 82 111 0002' },
  { id: 3, name: 'Priya Singh',    initials: 'PS', licenseNumber: 'WC11223344', vehicleType: 'Sedan',     vehicleReg: 'WC 112-233', area: { id: 4, name: 'East Rand'          }, partner: { id: 2, name: 'QuickHaul SA'       }, availabilityStatus: 'available', phone: '+27 82 111 0003' },
  { id: 4, name: 'Kobus Du Toit',  initials: 'KD', licenseNumber: 'GP99887766', vehicleType: 'Tow Truck', vehicleReg: 'GP 998-877', area: { id: 5, name: 'West Rand'          }, partner: null,                                   availabilityStatus: 'available', phone: '+27 82 111 0004' },
  { id: 5, name: 'Zanele Dube',    initials: 'ZD', licenseNumber: 'GP44556677', vehicleType: 'Truck',     vehicleReg: 'GP 445-566', area: { id: 3, name: 'Soweto'             }, partner: { id: 3, name: 'Metro Towing'       }, availabilityStatus: 'inactive',  phone: '+27 82 111 0005' },
  { id: 6, name: 'Marco Ferreira', initials: 'MF', licenseNumber: 'GP33221100', vehicleType: 'Van',       vehicleReg: 'GP 332-211', area: { id: 1, name: 'Johannesburg CBD' }, partner: { id: 2, name: 'QuickHaul SA'       }, availabilityStatus: 'busy',      phone: '+27 82 111 0006' },
];

export const MOCK_PARTNERS = [
  { id: 1, name: 'FastMove Logistics', contactName: 'Sarah Johnson',   email: 'sarah@fastmove.co.za',   phone: '+27 11 000 0001', commissionPct: 12, region: 'Gauteng', driverCount: 8,  activeTaskCount: 14 },
  { id: 2, name: 'QuickHaul SA',       contactName: 'David Patel',     email: 'david@quickhaul.co.za',  phone: '+27 11 000 0002', commissionPct: 10, region: 'Gauteng', driverCount: 5,  activeTaskCount: 9  },
  { id: 3, name: 'Metro Towing',       contactName: 'Anna van der Berg',email: 'anna@metrotowing.co.za', phone: '+27 11 000 0003', commissionPct: 15, region: 'Gauteng', driverCount: 4,  activeTaskCount: 3  },
];

export const MOCK_TASKS = [
  { id: 1, taskCode: 'TSK-001', category: 'parcel_delivery',  driver: { id: 1, name: 'Lebo Mokoena'   }, area: { id: 1, name: 'CBD'       }, status: 'in_progress', finalPrice: 152,  pickupAddress: '12 Commissioner St', deliveryAddress: '45 Sandton Dr'    },
  { id: 2, taskCode: 'TSK-002', category: 'vehicle_towing',   driver: { id: 4, name: 'Kobus Du Toit'  }, area: { id: 5, name: 'West Rand' }, status: 'assigned',    finalPrice: 890,  pickupAddress: '8 Hendrik Rd',       deliveryAddress: '2 Kruger Ave'      },
  { id: 3, taskCode: 'TSK-003', category: 'furniture_moving', driver: { id: 2, name: 'Thabo Nkosi'    }, area: { id: 2, name: 'Sandton'  }, status: 'completed',   finalPrice: 620,  pickupAddress: '99 Rivonia Rd',      deliveryAddress: '14 Braamfontein St' },
  { id: 4, taskCode: 'TSK-004', category: 'parcel_delivery',  driver: { id: 3, name: 'Priya Singh'    }, area: { id: 4, name: 'East Rand' }, status: 'assigned',    finalPrice: 98,   pickupAddress: '3 Van Riebeeck Rd',  deliveryAddress: '7 Springs Ave'     },
  { id: 5, taskCode: 'TSK-005', category: 'vehicle_towing',   driver: { id: 6, name: 'Marco Ferreira' }, area: { id: 1, name: 'CBD'       }, status: 'in_progress', finalPrice: 1240, pickupAddress: '55 Noord St',        deliveryAddress: '102 Booysens Rd'   },
  { id: 6, taskCode: 'TSK-006', category: 'furniture_moving', driver: { id: 1, name: 'Lebo Mokoena'  }, area: { id: 1, name: 'CBD'       }, status: 'completed',   finalPrice: 480,  pickupAddress: '18 Market St',       deliveryAddress: '30 Rissik St'      },
  { id: 7, taskCode: 'TSK-007', category: 'parcel_delivery',  driver: { id: 5, name: 'Zanele Dube'    }, area: { id: 3, name: 'Soweto'    }, status: 'cancelled',   finalPrice: 75,   pickupAddress: '6 Vilakazi St',      deliveryAddress: '12 Chris Hani Rd'  },
  { id: 8, taskCode: 'TSK-008', category: 'parcel_delivery',  driver: { id: 2, name: 'Thabo Nkosi'    }, area: { id: 2, name: 'Sandton'   }, status: 'assigned',    finalPrice: 110,  pickupAddress: '22 Alice Lane',      deliveryAddress: '5 Maude St'        },
];

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
