const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const listEmployees = asyncHandler(async (req, res) => {
  const filter = { role: "employee", isActive: true };
  if (req.user.role === "manager") filter.managerId = req.user._id;
  res.json({ success: true, data: await User.find(filter).select("employeeId name email department managerId") });
});

module.exports = { listEmployees };
