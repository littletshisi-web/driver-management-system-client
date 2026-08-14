const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load model associations at runtime so belongsTo/hasMany work on every request
require('../models/associations');

const authRoutes     = require('../routes/authRoutes');
const driverRoutes   = require('../routes/driverRoutes');
const partnerRoutes  = require('../routes/partnerRoutes');
const taskRoutes     = require('../routes/taskRoutes');
const reportRoutes   = require('../routes/reportRoutes');
const pricingRoutes  = require('../routes/pricingRoutes');
const helpRoutes     = require('../routes/helpRoutes');
const areaRoutes     = require('../routes/areaRoutes');
const auditRoutes    = require('../routes/auditRoutes');
const applicationRoutes = require('../routes/applicationRoutes');
const errorMiddleware = require('../middleware/errorMiddleware');

const app = express();

// ── Security ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// General API traffic — generous, since a dashboard-heavy admin app
// fires many requests per page load; this exists to catch abuse, not to
// throttle normal multi-page browsing by everyone behind one office IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Login specifically needs a much tighter limit — this is the actual
// brute-force guard, kept separate so it doesn't get diluted by (or
// itself dilute) normal API traffic from everyone else on the network.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', loginLimiter);

// ── Parsing & Compression ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ── Static uploads ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/drivers',  driverRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/pricing',  pricingRoutes);
app.use('/api/help',     helpRoutes);
app.use('/api/areas',    areaRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/audit',   auditRoutes);

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
