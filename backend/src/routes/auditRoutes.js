// src/routes/auditRoutes.js
const router = require('express').Router();
const { getAll } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', authorize('admin'), getAll);

module.exports = router;
