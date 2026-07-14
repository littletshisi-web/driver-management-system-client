// src/controllers/authController.js
const crypto = require('crypto');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Partner = require('../models/Partner');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { isValidEmailFormat, isValidEmailDeliverable } = require('../utils/emailValidator');
const { sendVerificationEmail } = require('../services/emailService');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const SELF_REGISTERABLE_ROLES = ['driver', 'partner'];
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Finds the Partner record linked to this user, or creates one if it
// doesn't exist yet (covers accounts registered before this link existed).
const getOrCreatePartnerId = async (user) => {
  if (user.role !== 'partner') return undefined;
  let partner = await Partner.findOne({ where: { userId: user.id } });
  if (!partner) {
    partner = await Partner.create({
      userId: user.id,
      name: user.name,
      contactName: user.name,
      contactEmail: user.email,
      contactPhone: `pending-${user.id}`,
    });
  }
  return partner.id;
};

// Finds the Driver record linked to this user, or creates one if it
// doesn't exist yet (covers accounts registered before this link existed).
const getOrCreateDriverId = async (user) => {
  if (user.role !== 'driver') return undefined;
  let driver = await Driver.findOne({ where: { userId: user.id } });
  if (!driver) {
    const [firstName, ...rest] = user.name.trim().split(' ');
    const lastName = rest.join(' ') || firstName;
    driver = await Driver.create({
      userId: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: `pending-${user.id}`,
    });
  }
  return driver.id;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const emailCheck = await isValidEmailDeliverable(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.reason });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.',
      });
    }

    const safeRole = SELF_REGISTERABLE_ROLES.includes(role) ? role : 'driver';

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    // ✅ Generate a one-time verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    const user = await User.create({
      name, email, password, role: safeRole,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    if (user.role === 'driver') {
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ') || firstName;

      await Driver.create({
        userId: user.id,
        firstName,
        lastName,
        email: user.email,
        phone: `pending-${user.id}`,
      });
    }

    if (user.role === 'partner') {
      await Partner.create({
        userId: user.id,
        name: user.name,
        contactName: user.name,
        contactEmail: user.email,
        contactPhone: `pending-${user.id}`,
      });
    }

    // ✅ Send the verification email. If this fails, the account still exists
    // but unverified — the user can request a resend later.
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
    }

    // ✅ No token issued yet — user must verify before logging in.
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account before logging in.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Verification token is required.' });

    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or already-used verification link.' });
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification link has expired. Please request a new one.' });
    }

    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) { next(err); }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ where: { email } });
    // Don't reveal whether the email exists — generic response either way
    if (!user || user.isVerified) {
      return res.json({ success: true, message: 'If that account exists and is unverified, a new email has been sent.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    await user.update({ verificationToken, verificationTokenExpires });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ success: true, message: 'If that account exists and is unverified, a new email has been sent.' });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!isValidEmailFormat(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account disabled' });

    // ✅ Block login until the email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox or request a new verification link.',
        unverified: true,
      });
    }

    await user.update({ lastLogin: new Date() });
    const token        = signToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    const partnerId      = await getOrCreatePartnerId(user);
    const driverId       = await getOrCreateDriverId(user);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        ...(partnerId && { partnerId }),
        ...(driverId && { driverId }),
      },
    });
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

const me = async (req, res, next) => {
  try {
    const partnerId = await getOrCreatePartnerId(req.user);
    const driverId  = await getOrCreateDriverId(req.user);
    const extra = { ...(partnerId && { partnerId }), ...(driverId && { driverId }) };
    const user = Object.keys(extra).length ? { ...req.user.toJSON(), ...extra } : req.user;
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, refresh, me, logout, verifyEmail, resendVerification };