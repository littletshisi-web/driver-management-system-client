// src/routes/partnerRoutes.js
const router = require('express').Router();
const c = require('../controllers/partnerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { audit } = require('../middleware/auditMiddleware');

router.use(protect);
router.get('/',       c.getAll);
router.get('/:id',    c.getOne);
router.post('/',      authorize('admin','manager'), audit('CREATE','Partner'), c.create);
router.put('/:id',    authorize('admin','manager'), audit('UPDATE','Partner'), c.update);
router.delete('/:id', authorize('admin'),           audit('DELETE','Partner'), c.remove);

module.exports = router;
