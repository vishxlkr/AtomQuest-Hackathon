import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "NO_TOKEN", "Authentication token is required");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("managerId", "name email employeeId");
    if (!user || !user.isActive) throw new ApiError(401, "UNAUTHORIZED", "User is inactive or missing");
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new ApiError(401, "TOKEN_EXPIRED", "Token expired");
    throw err;
  }
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "FORBIDDEN", "You do not have access to this resource"));
  }
  return next();
};

export { verifyToken, requireRole };