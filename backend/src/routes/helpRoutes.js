// src/routes/helpRoutes.js
const router = require('express').Router();
const { getTopics } = require('../controllers/helpController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/topics', getTopics);
module.exports = router;
