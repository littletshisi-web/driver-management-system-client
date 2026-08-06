// src/controllers/applicationController.js
const crypto = require('crypto');
const { Op } = require('sequelize');
const DriverApplication = require('../models/DriverApplication');
const {
  sendApplicationReceivedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendNewApplicationStaffNotification,
} = require('../services/emailService');

const REGISTRATION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const fileUrl = (file) => (file ? `/uploads/${file.filename}` : null);

// POST /api/applications — public, multipart/form-data
const create = async (req, res, next) => {
  try {
    const {
      applicantType, firstName, lastName, email, phone,
      idNumber, city, vehicleType, vehicleReg, fleetSize, notes,
    } = req.body;

    let serviceInterest = [];
    try { serviceInterest = JSON.parse(req.body.serviceInterest || '[]'); } catch { /* leave empty on malformed input */ }

    const files = req.files || {};

    // One live application per email at a time — stops duplicate/spam
    // submissions and duplicate registration tokens for the same person.
    const existing = await DriverApplication.findOne({
      where: { email, status: { [Op.in]: ['pending', 'approved'] } },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.status === 'approved'
          ? 'This email already has an approved application — check your inbox for the registration link.'
          : 'An application with this email is already under review.',
      });
    }

    const application = await DriverApplication.create({
      applicantType, firstName, lastName, email, phone,
      idNumber: idNumber || undefined,
      city: city || undefined,
      vehicleType: vehicleType || undefined,
      vehicleReg: vehicleReg || undefined,
      fleetSize: fleetSize ? Number(fleetSize) : undefined,
      serviceInterest,
      notes: notes || undefined,
      idDocUrl:      fileUrl(files.idDoc?.[0]),
      licenceDocUrl: fileUrl(files.licenceDoc?.[0]),
      discDocUrl:    fileUrl(files.discDoc?.[0]),
      photoUrl:      fileUrl(files.photo?.[0]),
      status: 'pending',
    });

    try {
      await sendApplicationReceivedEmail(email, firstName);
    } catch (emailErr) {
      console.error('Failed to send application received email:', emailErr.message);
    }

    try {
      await sendNewApplicationStaffNotification(application);
    } catch (emailErr) {
      console.error('Failed to send staff notification email:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Application received — we'll email you once it's been reviewed.",
      data: { id: application.id },
    });
  } catch (err) { next(err); }
};

// GET /api/applications — admin
const getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows, count } = await DriverApplication.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    res.json({ success: true, data: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) { next(err); }
};

// GET /api/applications/:id — admin
const getOne = async (req, res, next) => {
  try {
    const application = await DriverApplication.findByPk(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

// PATCH /api/applications/:id/approve — admin
const approve = async (req, res, next) => {
  try {
    const application = await DriverApplication.findByPk(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Application is already ${application.status}` });
    }

    const registrationToken = crypto.randomBytes(32).toString('hex');
    const registrationTokenExpires = new Date(Date.now() + REGISTRATION_TOKEN_TTL_MS);

    await application.update({
      status: 'approved',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      registrationToken,
      registrationTokenExpires,
      rejectionReason: null,
    });

    try {
      await sendApplicationApprovedEmail(application.email, application.firstName, registrationToken);
    } catch (emailErr) {
      console.error('Failed to send application approved email:', emailErr.message);
    }

    res.json({ success: true, message: 'Application approved — the applicant has been emailed a registration link.', data: application });
  } catch (err) { next(err); }
};

// PATCH /api/applications/:id/reject — admin
const reject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const application = await DriverApplication.findByPk(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Application is already ${application.status}` });
    }

    await application.update({
      status: 'rejected',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      rejectionReason: reason || null,
    });

    try {
      await sendApplicationRejectedEmail(application.email, application.firstName, reason);
    } catch (emailErr) {
      console.error('Failed to send application rejected email:', emailErr.message);
    }

    res.json({ success: true, message: 'Application rejected.', data: application });
  } catch (err) { next(err); }
};

// GET /api/applications/verify-token/:token — public
// Used by the Register page before showing the account-setup form: confirms
// the link is a genuinely approved, unused, unexpired application, and
// returns just enough to prefill/lock the form (never the full application).
const verifyToken = async (req, res, next) => {
  try {
    const application = await DriverApplication.findOne({ where: { registrationToken: req.params.token } });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Invalid or unknown registration link.' });
    }
    if (application.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'This application has not been approved.' });
    }
    if (application.userId) {
      return res.status(400).json({ success: false, message: 'This registration link has already been used — please log in instead.' });
    }
    if (application.registrationTokenExpires && application.registrationTokenExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'This registration link has expired — please contact us for a new one.' });
    }

    res.json({
      success: true,
      data: {
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        applicantType: application.applicantType,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getOne, approve, reject, verifyToken };
