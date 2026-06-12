// src/routes/taskRoutes.js
const router = require('express').Router();
const c = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { createTaskSchema } = require('../validators/taskValidator');

router.use(protect);
router.get('/',           c.getAll);
router.get('/:id',        c.getOne);
router.post('/',          authorize('admin','manager'), validate(createTaskSchema), audit('CREATE','Task'), c.create);
router.patch('/:id/status', authorize('admin','manager'), audit('UPDATE_STATUS','Task'), c.updateStatus);

// Missing endpoints that frontend expects
router.post('/:id/assign', authorize('admin','manager'), audit('ASSIGN','Task'), c.assignDriver);

module.exports = router;
