// src/services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Must be a domain you've verified in Resend's dashboard. Until you verify
// a domain, Resend's sandbox only allows sending to your own signup email,
// and the "from" address must be onboarding@resend.dev.
const FROM_ADDRESS = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_URL = process.env.CLIENT_URL || 'http://localhost:5174';

const sendVerificationEmail = async (toEmail, name, token) => {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Verify your DMS account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to DMS, ${name}!</h2>
        <p>Please confirm your email address to activate your account.</p>
        <p>
          <a href="${verifyUrl}"
             style="display:inline-block; padding:12px 24px; background:#f59e0b; color:#fff; text-decoration:none; border-radius:6px;">
            Verify Email
          </a>
        </p>
        <p>Or paste this link into your browser:</p>
        <p>${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return data;
};

module.exports = { sendVerificationEmail };