const Cycle = require("../models/Cycle");
const User = require("../models/User");
const GoalSheet = require("../models/GoalSheet");
const AuditLog = require("../models/AuditLog");
const CheckIn = require("../models/CheckIn");
const EscalationRule = require("../models/EscalationRule");
const EscalationLog = require("../models/EscalationLog");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { logAudit } = require("../utils/auditLogger");
const { createNotification } = require("../utils/notificationService");
const { generateUserId } = require("../utils/userIdGenerator");

const createCycle = asyncHandler(async (req, res) => {
  const cycle = new Cycle({ ...req.body, isActive: true, createdBy: req.user?._id });
  await cycle.validate();
  await Cycle.updateMany({}, { isActive: false });
  await cycle.save();
  res.status(201).json({ success: true, data: cycle });
});
const getActiveCycle = asyncHandler(async (req, res) => res.json({ success: true, data: await Cycle.findOne({ isActive: true }) }));
const getCycles = asyncHandler(async (req, res) => res.json({ success: true, data: await Cycle.find().sort({ year: -1 }) }));
const activateCycle = asyncHandler(async (req, res) => {
  const cycle = await Cycle.findById(req.params.id);
  if (!cycle) throw new ApiError(404, "CYCLE_NOT_FOUND", "Cycle not found");
  await Cycle.updateMany({}, { isActive: false });
  cycle.isActive = true;
  await cycle.save();
  res.json({ success: true, data: cycle });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const filter = {};
  ["role", "department"].forEach((key) => { if (req.query[key]) filter[key] = req.query[key]; });
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.search) filter.$or = [{ name: new RegExp(req.query.search, "i") }, { email: new RegExp(req.query.search, "i") }];
  const [items, total] = await Promise.all([User.find(filter).populate("managerId", "name email").skip((page - 1) * limit).limit(limit), User.countDocuments(filter)]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
});

const createUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const name = String(req.body.name || "").trim();
  const role = req.body.role || "employee";

  if (!["employee", "manager", "admin"].includes(role)) {
    throw new ApiError(400, "INVALID_ROLE", "Invalid user role");
  }
  if (!name) throw new ApiError(400, "NAME_REQUIRED", "Name is required");
  if (!email) throw new ApiError(400, "EMAIL_REQUIRED", "Email is required");
  if (await User.exists({ email })) throw new ApiError(409, "EMAIL_EXISTS", "Email already exists");
  if ((req.body.authProvider || "local") === "local" && !req.body.password) {
    throw new ApiError(400, "PASSWORD_REQUIRED", "Password is required");
  }

  const employeeId = await generateUserId(role);
  const payload = {
    ...req.body,
    name,
    email,
    role,
    employeeId,
    department: req.body.department ? String(req.body.department).trim() : undefined,
    managerId: req.body.managerId || null
  };
  const user = await User.create(payload);
  res.status(201).json({ success: true, data: user.toSafeObject() });
});
const updateUser = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.email) payload.email = String(payload.email).trim().toLowerCase();
  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  Object.assign(user, payload);
  await user.save();
  res.json({ success: true, data: user.toSafeObject() });
});
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  res.json({ success: true, data: user.toSafeObject() });
});

const unlockGoalSheet = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findByIdAndUpdate(req.params.sheetId, { isLocked: false, unlockedBy: req.user._id }, { new: true });
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  await logAudit({ entityType: "goalsheet", entityId: sheet._id, action: "GOAL_UNLOCKED", changedBy: req.user._id, reason: req.body.reason });
  await createNotification(sheet.employeeId, "GOAL_UNLOCKED", "Goal sheet unlocked", req.body.reason || "Your goal sheet was unlocked.", "/goals");
  res.json({ success: true, data: sheet });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.entityType) filter.entityType = req.query.entityType;
  if (req.query.entityId) filter.entityId = req.query.entityId;
  if (req.query.changedBy) filter.changedBy = req.query.changedBy;
  if (req.query.from || req.query.to) filter.timestamp = {};
  if (req.query.from) filter.timestamp.$gte = new Date(req.query.from);
  if (req.query.to) filter.timestamp.$lte = new Date(req.query.to);
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const [items, total] = await Promise.all([AuditLog.find(filter).populate("changedBy", "name email").sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit), AuditLog.countDocuments(filter)]);
  res.json({ success: true, data: { items, total, page } });
});

const getCompletionDashboard = asyncHandler(async (req, res) => {
  const cycle = await Cycle.findOne({ isActive: true });
  const employees = await User.find({ role: "employee", isActive: true });
  const sheets = await GoalSheet.find({ cycleId: cycle?._id });
  const checkInCompletion = {};
  for (const quarter of ["Q1", "Q2", "Q3", "Q4"]) {
    checkInCompletion[quarter] = { done: await CheckIn.countDocuments({ cycleId: cycle?._id, quarter, isCompleted: true }), total: employees.length };
  }
  res.json({ success: true, data: { totalEmployees: employees.length, goalsSubmitted: sheets.filter((s) => ["submitted", "approved"].includes(s.approvalStatus)).length, goalsApproved: sheets.filter((s) => s.approvalStatus === "approved").length, goalsPending: employees.length - sheets.filter((s) => ["submitted", "approved"].includes(s.approvalStatus)).length, checkInCompletion } });
});

const getOrgHierarchy = asyncHandler(async (req, res) => {
  const managers = await User.find({ role: "manager" }).lean();
  const reports = await User.find({ role: "employee" }).lean();
  res.json({ success: true, data: managers.map((m) => ({ ...m, reports: reports.filter((r) => String(r.managerId) === String(m._id)) })) });
});

const listEscalationRules = asyncHandler(async (req, res) => res.json({ success: true, data: await EscalationRule.find().sort({ createdAt: -1 }) }));
const createEscalationRule = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await EscalationRule.create({ ...req.body, createdBy: req.user._id }) }));
const updateEscalationRule = asyncHandler(async (req, res) => {
  const rule = await EscalationRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!rule) throw new ApiError(404, "RULE_NOT_FOUND", "Escalation rule not found");
  res.json({ success: true, data: rule });
});
const deleteEscalationRule = asyncHandler(async (req, res) => {
  const rule = await EscalationRule.findByIdAndDelete(req.params.id);
  if (!rule) throw new ApiError(404, "RULE_NOT_FOUND", "Escalation rule not found");
  res.json({ success: true });
});
const listEscalationLogs = asyncHandler(async (req, res) => {
  const logs = await EscalationLog.find()
    .populate("ruleId", "triggerEvent thresholdDays escalateTo")
    .populate("affectedUserId", "name email")
    .populate("escalatedToUserId", "name email")
    .sort({ triggeredAt: -1 });
  res.json({ success: true, data: logs });
});

module.exports = { createCycle, getActiveCycle, getCycles, activateCycle, getAllUsers, createUser, updateUser, deactivateUser, unlockGoalSheet, getAuditLogs, getCompletionDashboard, getOrgHierarchy, listEscalationRules, createEscalationRule, updateEscalationRule, deleteEscalationRule, listEscalationLogs };
