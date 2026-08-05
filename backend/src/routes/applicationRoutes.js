// src/routes/applicationRoutes.js
const router = require('express').Router();
const c = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { createApplicationSchema } = require('../validators/applicationValidator');
const upload = require('../config/multer');

// ── Public — anyone can apply, no auth required ─────────────────────────────
router.post(
  '/',
  upload.fields([
    { name: 'idDoc',      maxCount: 1 },
    { name: 'licenceDoc', maxCount: 1 },
    { name: 'discDoc',    maxCount: 1 },
    { name: 'photo',      maxCount: 1 },
  ]),
  validate(createApplicationSchema),
  c.create,
);

// Public — the Register page verifies an approval link through this before
// showing the account-setup form.
router.get('/verify-token/:token', c.verifyToken);

// ── Admin/manager only from here down ───────────────────────────────────────
router.use(protect, authorize('admin', 'manager'));

router.get('/',              c.getAll);
router.get('/:id',           c.getOne);
router.patch('/:id/approve', audit('APPROVE', 'DriverApplication'), c.approve);
router.patch('/:id/reject',  audit('REJECT', 'DriverApplication'),  c.reject);

module.exports = router;
