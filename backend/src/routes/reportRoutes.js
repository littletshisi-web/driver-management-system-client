// src/routes/reportRoutes.js
const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// List generated reports
router.get('/',    c.getAll);

// Generate a new report
router.post('/generate', authorize('admin','manager'), c.generate);

// Earnings report endpoint — frontend calls GET /api/reports/earnings
router.get('/earnings', c.getEarnings);

// Task report endpoint — frontend calls GET /api/reports/tasks
router.get('/tasks', c.getTaskReport);

// Export endpoint — frontend calls GET /api/reports/export?type=csv|pdf
router.get('/export', c.exportReport);

module.exports = router;
