// src/middleware/authMiddleware.js
const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { protect };
