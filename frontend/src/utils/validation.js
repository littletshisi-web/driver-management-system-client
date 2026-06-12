// Returns an object of field errors. Empty object = valid.
// These run before API calls to give instant feedback.
// The backend also validates — if it returns 400, display error.message.

export function validateDriver({ name, phone, licenseNumber, vehicleType, vehicleReg }) {
  const errors = {};
  if (!name?.trim())         errors.name         = 'Full name is required';
  if (!phone?.trim())        errors.phone        = 'Phone number is required';
  if (!licenseNumber?.trim()) errors.licenseNumber = 'License number is required';
  if (!vehicleType?.trim())  errors.vehicleType  = 'Vehicle type is required';
  if (!vehicleReg?.trim())   errors.vehicleReg   = 'Vehicle registration is required';
  return errors;
}

export function validatePartner({ name, contactName, email, phone, commissionPct }) {
  const errors = {};
  if (!name?.trim())        errors.name        = 'Company name is required';
  if (!contactName?.trim()) errors.contactName = 'Contact person is required';
  if (!email?.trim())       errors.email       = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';
  if (!phone?.trim())       errors.phone       = 'Phone is required';
  if (commissionPct == null || commissionPct === '') errors.commissionPct = 'Commission % is required';
  else if (commissionPct < 0 || commissionPct > 100) errors.commissionPct = 'Must be between 0 and 100';
  return errors;
}

export function validateTask({ category, driverId, areaId, distanceKm, pickupAddress, deliveryAddress }) {
  const errors = {};
  if (!category)           errors.category        = 'Category is required';
  if (!driverId)           errors.driverId        = 'Please assign a driver';
  if (!areaId)             errors.areaId          = 'Please select an area';
  if (!distanceKm || distanceKm <= 0) errors.distanceKm = 'Enter a valid distance';
  if (!pickupAddress?.trim())   errors.pickupAddress   = 'Pickup address is required';
  if (!deliveryAddress?.trim()) errors.deliveryAddress = 'Delivery address is required';
  return errors;
}

export function validateArea({ name, region, priceModifier }) {
  const errors = {};
  if (!name?.trim())   errors.name   = 'Area name is required';
  if (!region?.trim()) errors.region = 'Region is required';
  if (!priceModifier || priceModifier < 0.5 || priceModifier > 5)
    errors.priceModifier = 'Modifier must be between 0.5 and 5.0';
  return errors;
}

/** Returns true if an errors object has no keys (i.e. form is valid). */
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}
