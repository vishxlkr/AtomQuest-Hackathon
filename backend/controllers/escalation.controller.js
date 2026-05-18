import EscalationRule from "../models/EscalationRule.js";
import EscalationLog from "../models/EscalationLog.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const VALID_EVENTS = ["GOAL_NOT_SUBMITTED", "GOAL_NOT_APPROVED", "CHECKIN_NOT_DONE"];
const VALID_TARGETS = ["employee", "manager", "skip_level", "hr", "admin", "custom"];

function normalizeEscalationChain(body) {
  const source = Array.isArray(body.escalationChain) && body.escalationChain.length
    ? body.escalationChain
    : [{ target: body.escalateTo || "manager", afterDays: body.thresholdDays }];
  const chain = source.map((stage) => ({
    target: stage.target,
    targetUserId: stage.target === "custom" ? stage.targetUserId : null,
    afterDays: Number(stage.afterDays)
  }));
  chain.forEach((stage) => {
    if (!VALID_TARGETS.includes(stage.target)) throw new ApiError(400, "INVALID_TARGET", "Invalid escalation target");
    if (stage.target === "custom" && !stage.targetUserId) throw new ApiError(400, "CUSTOM_TARGET_REQUIRED", "Select a user for custom escalation stages");
    if (!Number(stage.afterDays) || Number(stage.afterDays) < 1) throw new ApiError(400, "INVALID_THRESHOLD", "Stage days must be at least 1");
  });
  chain.sort((a, b) => a.afterDays - b.afterDays);
  return chain;
}

function validateRulePayload(body) {
  if (!VALID_EVENTS.includes(body.triggerEvent)) throw new ApiError(400, "INVALID_TRIGGER", "Invalid trigger event");
  return normalizeEscalationChain(body);
}

const getRules = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await EscalationRule.find().populate("escalationChain.targetUserId", "name email role department employeeId").sort({ createdAt: -1 }) });
});

const getEscalationUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || "").trim();
  const filter = { isActive: true };
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: pattern }, { email: pattern }, { employeeId: pattern }, { department: pattern }];
  }
  const users = await User.find(filter)
    .select("name email role department employeeId")
    .sort({ name: 1 })
    .limit(200);
  res.json({ success: true, data: users });
});

const createRule = asyncHandler(async (req, res) => {
  const escalationChain = validateRulePayload(req.body);
  const rule = await EscalationRule.create({
    ...req.body,
    escalationChain,
    thresholdDays: escalationChain[0].afterDays,
    escalateTo: ["employee", "custom"].includes(escalationChain[0].target) ? "manager" : escalationChain[0].target,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, data: rule });
});

const updateRule = asyncHandler(async (req, res) => {
  const existing = await EscalationRule.findById(req.params.id);
  if (!existing) throw new ApiError(404, "RULE_NOT_FOUND", "Escalation rule not found");
  let escalationChain;
  if (req.body.triggerEvent || req.body.thresholdDays || req.body.escalateTo || req.body.escalationChain) {
    escalationChain = validateRulePayload({
      triggerEvent: req.body.triggerEvent || existing.triggerEvent,
      thresholdDays: req.body.thresholdDays || existing.thresholdDays,
      escalateTo: req.body.escalateTo || existing.escalateTo,
      escalationChain: req.body.escalationChain || existing.escalationChain
    });
  }
  const update = { ...req.body };
  if (escalationChain) {
    update.escalationChain = escalationChain;
    update.thresholdDays = escalationChain[0].afterDays;
    update.escalateTo = ["employee", "custom"].includes(escalationChain[0].target) ? "manager" : escalationChain[0].target;
  }
  const rule = await EscalationRule.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  res.json({ success: true, data: rule });
});

const deleteRule = asyncHandler(async (req, res) => {
  await EscalationRule.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const getEscalationLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const filter = {};
  if (req.query.triggerEvent) filter.triggerEvent = req.query.triggerEvent;
  if (req.query.isResolved !== undefined) filter.isResolved = req.query.isResolved === "true";
  if (req.query.dateFrom || req.query.dateTo) filter.triggeredAt = {};
  if (req.query.dateFrom) filter.triggeredAt.$gte = new Date(req.query.dateFrom);
  if (req.query.dateTo) filter.triggeredAt.$lte = new Date(req.query.dateTo);
  const [items, total] = await Promise.all([
    EscalationLog.find(filter)
      .populate("affectedUserId", "name email department employeeId")
      .populate("escalatedToUserId", "name email department employeeId")
      .populate("ruleId", "triggerEvent thresholdDays escalateTo description")
      .sort({ triggeredAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    EscalationLog.countDocuments(filter)
  ]);
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
});

const resolveEscalation = asyncHandler(async (req, res) => {
  const log = await EscalationLog.findByIdAndUpdate(
    req.params.id,
    { isResolved: true, resolvedAt: new Date(), resolvedBy: req.user._id },
    { new: true }
  );
  if (!log) throw new ApiError(404, "LOG_NOT_FOUND", "Escalation log not found");
  res.json({ success: true, data: log });
});

export { getRules, getEscalationUsers, createRule, updateRule, deleteRule, getEscalationLogs, resolveEscalation };
