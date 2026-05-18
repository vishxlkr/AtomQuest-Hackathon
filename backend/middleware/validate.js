const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return next(new ApiError(400, "VALIDATION_ERROR", "Request validation failed", errors.array()));
}

module.exports = { validateRequest };
