diff --git a/backend/src/routes/authRoutes.js b/backend/src/routes/authRoutes.js
@@
-const { register, login, refresh, me } = require('../controllers/authController');
+const { register, login, refresh, me } = require('../controllers/authController');
@@
 router.get('/me',        protect, me);diff --git a/backend/src/routes/authRoutes.js b/backend/src/routes/authRoutes.js
@@
-const { register, login, refresh, me } = require('../controllers/authController');
+const { register, login, refresh, me } = require('../controllers/authController');
@@
 router.get('/me',        protect, me);
 router.post('/logout',   protect, logout);diff --git a/backend/src/routes/authRoutes.js b/backend/src/routes/authRoutes.js
@@
-const { register, login, refresh, me } = require('../controllers/authController');
+const { register, login, refresh, me } = require('../controllers/authController');
@@
 router.get('/me',        protect, me);
 router.post('/logout',   protect, logout);
-const { register, login, refresh, me } = require('../controllers/authController');
+const { register, login, refresh, me } = require('../controllers/authController');
@@
 router.get('/me',        protect, me);
 router.post('/logout',   protect, logout);
 router.post('/logout',   protect, logout);// src/routes/authRoutes.js
const router = require('express').Router();
const { register, login, refresh, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/refresh',  refresh);
router.get('/me',        protect, me);
router.post('/logout',   protect, logout);

module.exports = router;
