// src/routes/taskRoutes.js
const router = require('express').Router();
const c = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { createTaskSchema } = require('../validators/taskValidator');

router.use(protect);

// Stats routes — must be before /:id
router.get('/stats',               authorize('admin', 'manager', 'partner'), c.getStats);
router.get('/stats-by-category',   authorize('admin', 'manager'), c.getStatsByCategory);

router.get('/',             c.getAll);
router.get('/:id',          c.getOne);
// Partners can create tasks for their own drivers too (Tasks.jsx shows the
// "New Task" button to everyone except the driver role) — ownership of the
// driverId/partnerId on the body is enforced server-side in c.create.
router.post('/',            authorize('admin','manager','partner'), validate(createTaskSchema), audit('CREATE','Task'), c.create);
// Drivers progress their own tasks (Start/Complete) and partners can too —
// Tasks.jsx shows these actions to every non-admin role. c.updateStatus
// verifies the caller actually owns the task before allowing the change.
router.patch('/:id/status', authorize('admin','manager','partner','driver'), audit('UPDATE_STATUS','Task'), c.updateStatus);
router.post('/:id/assign',  authorize('admin','manager'), audit('ASSIGN','Task'), c.assignDriver);

module.exports = router;