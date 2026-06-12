import api from './axiosInstance.js';
import { API } from '../constants/apiRoutes.js';

// GET /api/areas
// Response: { data: Area[] }
export const getAreas = () =>
  api.get(API.AREAS);

// POST /api/areas
// Body: { name, region, priceModifier, zoneType }
// Response: { data: Area }
export const createArea = (data) =>
  api.post(API.AREAS, data);

// PUT /api/areas/:id
// Body: Partial area fields
// Response: { data: Area }
export const updateArea = (id, data) =>
  api.put(API.AREA(id), data);
