// src/routes/pricingRoutes.js
const router = require('express').Router();
const c = require('../controllers/pricingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { audit } = require('../middleware/auditMiddleware');
router.use(protect);
router.get('/rules',      c.getConfig);
router.put('/rules',      authorize('admin'), audit('UPDATE','Pricing'), c.updateConfig);
router.post('/calculate', c.calculate);
module.exports = router;
