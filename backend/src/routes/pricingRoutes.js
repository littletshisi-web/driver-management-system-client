// src/routes/pricingRoutes.js
const router = require('express').Router();
const c = require('../controllers/pricingController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/config',    c.getConfig);
router.post('/calculate', c.calculate);
module.exports = router;
