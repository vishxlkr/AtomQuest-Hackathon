import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const listEmployees = asyncHandler(async (req, res) => {
  const filter = { role: "employee", isActive: true };
  if (req.user.role === "manager") filter.managerId = req.user._id;
  res.json({ success: true, data: await User.find(filter).select("employeeId name email department managerId") });
});

export { listEmployees };