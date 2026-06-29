// src/services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Shared styles ────────────────────────────────────────────────────────────
const base = (content) => `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#1e3a5f;padding:24px 32px;">
      <span style="color:#f59e0b;font-size:20px;font-weight:700;letter-spacing:-0.5px;">DMS</span>
      <span style="color:#93c5fd;font-size:13px;margin-left:10px;">Driver Management System</span>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;text-align:center;">
      This is an automated message from FleetHQ · DMS. Please do not reply to this email.
    </div>
  </div>
`;

const btn = (url, label) =>
  `<a href="${url}" style="display:inline-block;padding:12px 28px;background:#f59e0b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;margin:16px 0;">${label}</a>`;

const send = async (to, subject, html) => {
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
};

// ─── 1. Email verification (registration) ─────────────────────────────────────
const sendVerificationEmail = async (toEmail, name, token) => {
  const url = `${APP_URL}/verify-email?token=${token}`;
  return send(toEmail, 'Verify your DMS account', base(`
    <h2 style="color:#1e3a5f;margin-top:0;">Welcome to DMS, ${name}!</h2>
    <p style="color:#475569;">Please confirm your email address to activate your account.</p>
    ${btn(url, 'Verify Email')}
    <p style="color:#94a3b8;font-size:12px;">Or paste this link: <a href="${url}" style="color:#f59e0b;">${url}</a></p>
    <p style="color:#94a3b8;font-size:12px;">This link expires in 24 hours.</p>
  `));
};

// ─── 2. Task assigned to driver ───────────────────────────────────────────────
const sendTaskAssignedEmail = async (driverEmail, driverName, task) => {
  return send(driverEmail, `New task assigned: ${task.taskCode}`, base(`
    <h2 style="color:#1e3a5f;margin-top:0;">New Task Assigned</h2>
    <p style="color:#475569;">Hi ${driverName}, you have been assigned a new task.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;width:40%;">Task Code</td>
        <td style="padding:10px 12px;color:#475569;">${task.taskCode}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Category</td>
        <td style="padding:10px 12px;color:#475569;">${task.category ?? '—'}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Pickup</td>
        <td style="padding:10px 12px;color:#475569;">${task.pickupAddress}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Drop-off</td>
        <td style="padding:10px 12px;color:#475569;">${task.dropoffAddress}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Distance</td>
        <td style="padding:10px 12px;color:#475569;">${task.distanceKm ?? '—'} km</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Total Fare</td>
        <td style="padding:10px 12px;color:#1e3a5f;font-weight:700;">R ${(task.totalFare ?? 0).toFixed(2)}</td>
      </tr>
    </table>
    ${btn(`${APP_URL}/tasks`, 'View Task Board')}
  `));
};

// ─── 3. Task completed ────────────────────────────────────────────────────────
const sendTaskCompletedEmail = async (partnerEmail, partnerName, task, driverName) => {
  return send(partnerEmail, `Task completed: ${task.taskCode}`, base(`
    <h2 style="color:#1e3a5f;margin-top:0;">Task Completed ✓</h2>
    <p style="color:#475569;">Hi ${partnerName}, task <strong>${task.taskCode}</strong> has been marked as delivered by ${driverName}.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;width:40%;">Task Code</td>
        <td style="padding:10px 12px;color:#475569;">${task.taskCode}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Driver</td>
        <td style="padding:10px 12px;color:#475569;">${driverName}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Pickup</td>
        <td style="padding:10px 12px;color:#475569;">${task.pickupAddress}</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Drop-off</td>
        <td style="padding:10px 12px;color:#475569;">${task.dropoffAddress}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px 12px;font-weight:600;color:#1e3a5f;">Total Fare</td>
        <td style="padding:10px 12px;color:#1e3a5f;font-weight:700;">R ${(task.totalFare ?? 0).toFixed(2)}</td>
      </tr>
    </table>
    ${btn(`${APP_URL}/reports`, 'View Reports')}
  `));
};

// ─── 4. Driver suspended ──────────────────────────────────────────────────────
const sendDriverSuspendedEmail = async (driverEmail, driverName) => {
  return send(driverEmail, 'Your DMS account has been suspended', base(`
    <h2 style="color:#991b1b;margin-top:0;">Account Suspended</h2>
    <p style="color:#475569;">Hi ${driverName},</p>
    <p style="color:#475569;">Your driver account has been suspended and you will no longer receive task assignments.</p>
    <p style="color:#475569;">If you believe this is an error, please contact your partner or the operations team:</p>
    <p style="color:#475569;">📞 <strong>0785573668</strong><br>✉️ <strong>info@danigroup.co.za</strong></p>
  `));
};

// ─── 5. Partner welcome email ─────────────────────────────────────────────────
const sendPartnerWelcomeEmail = async (partnerEmail, partnerName, contactName) => {
  return send(partnerEmail, `Welcome to DMS — ${partnerName}`, base(`
    <h2 style="color:#1e3a5f;margin-top:0;">Welcome to DMS, ${contactName}!</h2>
    <p style="color:#475569;"><strong>${partnerName}</strong> has been registered as a partner on the Driver Management System.</p>
    <p style="color:#475569;">You can now log in to manage your drivers and track task performance.</p>
    ${btn(`${APP_URL}/login`, 'Go to Dashboard')}
    <p style="color:#94a3b8;font-size:12px;">If you have any questions, contact us at info@danigroup.co.za or 0785573668.</p>
  `));
};

// ─── 6. Driver assigned to partner ───────────────────────────────────────────
const sendDriverAssignedEmail = async (driverEmail, driverName, partnerName) => {
  return send(driverEmail, `You've been assigned to ${partnerName}`, base(`
    <h2 style="color:#1e3a5f;margin-top:0;">Partner Assignment</h2>
    <p style="color:#475569;">Hi ${driverName},</p>
    <p style="color:#475569;">You have been assigned to partner <strong>${partnerName}</strong>. You will now receive task assignments from them.</p>
    ${btn(`${APP_URL}/dashboard`, 'View Dashboard')}
  `));
};

module.exports = {
  sendVerificationEmail,
  sendTaskAssignedEmail,
  sendTaskCompletedEmail,
  sendDriverSuspendedEmail,
  sendPartnerWelcomeEmail,
  sendDriverAssignedEmail,
};