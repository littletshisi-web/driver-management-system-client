// src/routes/areaRoutes.js
const router = require('express').Router();
const c = require('../controllers/areaController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/',       c.getAll);
router.post('/',      authorize('admin', 'manager'), c.create);
router.put('/:id',    authorize('admin', 'manager'), c.update);
router.delete('/:id', authorize('admin'),            c.remove);

module.exports = router;
