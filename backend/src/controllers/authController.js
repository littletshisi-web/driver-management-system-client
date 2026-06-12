// src/controllers/authController.js
const User = require('../models/User');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account disabled' });
    await user.update({ lastLogin: new Date() });
    const token        = signToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    res.json({ success: true, token, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const token = signToken({ id: user.id, role: user.role });
    res.json({ success: true, token });
  } catch { res.status(401).json({ success: false, message: 'Invalid refresh token' }); }
};

const me = async (req, res) => res.json({ success: true, user: req.user });

module.exports = { register, login, refresh, me };
