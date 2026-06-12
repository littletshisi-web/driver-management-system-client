// src/middleware/auditMiddleware.js
const AuditLog = require('../models/AuditLog');

const audit = (action, entity) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400) {
      try {
        await AuditLog.create({
          userId:    req.user?.id,
          action,
          entity,
          entityId:  req.params?.id,
          changes:   req.body || {},
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      } catch { /* silent */ }
    }
  });
  next();
};

module.exports = { audit };
