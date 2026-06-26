// src/routes/reportRoutes.js
const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/',                 c.getAll);
router.post('/generate',        authorize('admin', 'manager'), c.generate);
router.get('/earnings',         c.getEarnings);
router.get('/tasks',            c.getTaskReport);
router.get('/revenue-summary',  authorize('admin', 'manager'), c.getRevenueSummary);
router.get('/tasks-by-day',     authorize('admin', 'manager'), c.getTasksByDay);
router.get('/export',           c.exportReport);

module.exports = router;