const EscalationRule = require("../models/EscalationRule");
const EscalationLog = require("../models/EscalationLog");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const VALID_EVENTS = ["GOAL_NOT_SUBMITTED", "GOAL_NOT_APPROVED", "CHECKIN_NOT_DONE"];
const VALID_TARGETS = ["manager", "skip_level", "admin"];

function validateRulePayload(body) {
  if (!VALID_EVENTS.includes(body.triggerEvent)) throw new ApiError(400, "INVALID_TRIGGER", "Invalid trigger event");
  if (!Number(body.thresholdDays) || Number(body.thresholdDays) < 1) throw new ApiError(400, "INVALID_THRESHOLD", "Threshold days must be at least 1");
  if (!VALID_TARGETS.includes(body.escalateTo)) throw new ApiError(400, "INVALID_TARGET", "Invalid escalation target");
}

const getRules = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await EscalationRule.find().sort({ createdAt: -1 }) });
});

const createRule = asyncHandler(async (req, res) => {
  validateRulePayload(req.body);
  const rule = await EscalationRule.create({ ...req.body, thresholdDays: Number(req.body.thresholdDays), createdBy: req.user._id });
  res.status(201).json({ success: true, data: rule });
});

const updateRule = asyncHandler(async (req, res) => {
  const existing = await EscalationRule.findById(req.params.id);
  if (!existing) throw new ApiError(404, "RULE_NOT_FOUND", "Escalation rule not found");
  if (req.body.triggerEvent || req.body.thresholdDays || req.body.escalateTo) {
    validateRulePayload({
      triggerEvent: req.body.triggerEvent || existing.triggerEvent,
      thresholdDays: req.body.thresholdDays || existing.thresholdDays,
      escalateTo: req.body.escalateTo || existing.escalateTo
    });
  }
  const rule = await EscalationRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

module.exports = { getRules, createRule, updateRule, deleteRule, getEscalationLogs, resolveEscalation };
