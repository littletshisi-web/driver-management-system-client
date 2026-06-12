// src/routes/authRoutes.js
const router = require('express').Router();
const { register, login, refresh, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/refresh',  refresh);
router.get('/me',        protect, me);

module.exports = router;
