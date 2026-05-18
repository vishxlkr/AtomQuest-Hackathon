import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return next(new ApiError(400, "VALIDATION_ERROR", "Request validation failed", errors.array()));
}

export { validateRequest };