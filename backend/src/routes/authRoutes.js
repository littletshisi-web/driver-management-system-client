// src/routes/authRoutes.js
const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',           c.register);
router.post('/login',              c.login);
router.post('/refresh',            c.refresh);
router.post('/logout',             c.logout);
router.get('/me',     protect,     c.me);

// ✅ Email verification
router.get('/verify-email',        c.verifyEmail);       // ?token=...
router.post('/resend-verification',c.resendVerification); // { email }

module.exports = router;