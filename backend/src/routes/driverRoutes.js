// src/routes/driverRoutes.js
const router = require('express').Router();
const c = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { createDriverSchema, updateDriverSchema } = require('../validators/driverValidator');
const upload = require('../config/multer');

router.use(protect);

// Dashboard stats — must be before /:id to avoid route conflict
router.get('/stats', authorize('admin', 'manager'), c.getStats);

router.get('/',         c.getAll);
router.get('/:id',      c.getOne);
router.post('/',        authorize('admin','manager'), validate(createDriverSchema), audit('CREATE','Driver'), c.create);
router.put('/:id',      authorize('admin','manager'), validate(updateDriverSchema), audit('UPDATE','Driver'), c.update);
router.delete('/:id',   authorize('admin'),            audit('DELETE','Driver'),   c.remove);

router.patch('/:id/suspend',         authorize('admin','manager'), audit('SUSPEND','Driver'),        c.suspend);
router.post('/:id/assign-partner',   authorize('admin','manager'), audit('ASSIGN','Driver'),         c.assignPartner);
router.delete('/:id/remove-partner', authorize('admin','manager'), audit('REMOVE_PARTNER','Driver'), c.removePartner);

router.post('/:id/docs/:field', authorize('admin','manager'), upload.single('file'), c.uploadDoc);

module.exports = router;