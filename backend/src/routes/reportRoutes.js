// src/routes/reportRoutes.js
const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
router.use(protect);
router.get('/',    c.getAll);
router.post('/generate', authorize('admin','manager'), c.generate);
module.exports = router;

// --- save separately ---
