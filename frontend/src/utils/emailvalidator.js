// src/utils/emailValidator.js
const dns = require('dns');
const { promisify } = require('util');

const resolveMx = promisify(dns.resolveMx);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks only the shape of the email (no network call).
// Use this on login, where re-verifying deliverability doesn't make sense
// for an already-registered address.
const isValidEmailFormat = (email) => {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

// Checks format AND that the domain has at least one MX record,
// meaning it's actually configured to receive mail.
// Use this on registration, to catch typos like "gmial.com" or fake domains.
// Returns { valid: boolean, reason?: string }
const isValidEmailDeliverable = async (email) => {
  if (!isValidEmailFormat(email)) {
    return { valid: false, reason: 'Invalid email format.' };
  }

  const domain = email.trim().split('@')[1];

  try {
    const records = await resolveMx(domain);
    if (!records || records.length === 0) {
      return { valid: false, reason: 'Email domain cannot receive mail.' };
    }
    return { valid: true };
  } catch (err) {
    // ENOTFOUND / ENODATA means the domain has no MX records or doesn't exist
    return { valid: false, reason: 'Email domain does not exist or cannot receive mail.' };
  }
};

module.exports = { isValidEmailFormat, isValidEmailDeliverable };