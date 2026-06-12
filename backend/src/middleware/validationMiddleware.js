// src/middleware/validationMiddleware.js
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message);
    return res.status(422).json({ success: false, message: 'Validation failed', errors: details });
  }
  next();
};

module.exports = { validate };
