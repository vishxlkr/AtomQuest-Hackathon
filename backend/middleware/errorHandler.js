function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || "SERVER_ERROR";
  let message = err.message || "Something went wrong";
  let details = err.details;

  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    details = Object.values(err.errors).map((item) => ({ field: item.path, message: item.message }));
    message = "Validation failed";
  }
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid resource identifier";
  }
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    message = "Duplicate value is not allowed";
    details = err.keyValue;
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Token expired";
  }

  const payload = { success: false, error: { code, message } };
  if (details) payload.error.details = details;
  if (process.env.NODE_ENV !== "production" && err.stack) payload.error.stack = err.stack;
  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
