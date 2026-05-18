import Goal from "../models/Goal.js";
import GoalSheet from "../models/GoalSheet.js";
import CheckIn from "../models/CheckIn.js";
import User from "../models/User.js";
import Cycle from "../models/Cycle.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateProgressScore } from "../utils/progressScore.js";
import { logAudit } from "../utils/auditLogger.js";
import { createNotification } from "../utils/notificationService.js";

async function resolveCheckInQuarter(requestedQuarter) {
  if (requestedQuarter) return requestedQuarter;
  const cycle = await Cycle.findOne({ isActive: true });
  const now = new Date();
  const activeQuarter = cycle?.quarters?.find((q) => now >= q.windowOpen && now <= q.windowClose);
  if (activeQuarter?.quarter) return activeQuarter.quarter;
  const latestStartedQuarter = [...(cycle?.quarters || [])].sort((a, b) => b.windowOpen - a.windowOpen).find((q) => now >= q.windowOpen);
  return latestStartedQuarter?.quarter || cycle?.quarters?.[0]?.quarter || "Q1";
}

const updateQuarterlyAchievement = asyncHandler(async (req, res) => {
  const updates = Array.isArray(req.body.items) ? req.body.items : [req.body];
  const saved = [];
  for (const item of updates) {
    const goal = await Goal.findById(item.goalId);
    if (!goal) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found");
    const sheet = await GoalSheet.findById(goal.goalSheetId);
    if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
    if (String(sheet.employeeId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Cannot update another employee goal");
    const quarter = item.quarter || req.currentQuarter;
    const score = calculateProgressScore(goal.uomType, goal.target, item.actualAchievement, goal.target);
    const existing = goal.quarterly.find((q) => q.quarter === quarter);
    const next = { quarter, plannedTarget: item.plannedTarget || goal.target, actualAchievement: item.actualAchievement, progressStatus: item.progressStatus || "on_track", progressScore: score, updatedAt: new Date() };
    if (existing) Object.assign(existing, next);
    else goal.quarterly.push(next);
    await goal.save();
    saved.push(goal);
    await logAudit({ entityType: "goal", entityId: goal._id, action: "QUARTERLY_ACHIEVEMENT_UPDATED", changedBy: req.user._id, newValue: next });
  }
  res.json({ success: true, data: saved });
});

const getQuarterlyProgress = asyncHandler(async (req, res) => {
  const cycle = await Cycle.findOne({ isActive: true });
  const sheet = await GoalSheet.findOne({ employeeId: req.user._id, cycleId: cycle?._id });
  const goals = sheet ? await Goal.find({ goalSheetId: sheet._id }) : [];
  res.json({ success: true, data: { sheet, goals } });
});

const conductCheckIn = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findById(req.body.goalSheetId || req.params.sheetId);
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  const employee = await User.findById(sheet.employeeId);
  if (!employee) throw new ApiError(404, "EMPLOYEE_NOT_FOUND", "Employee not found");
  if (req.user.role === "manager" && String(employee.managerId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not your team member");
  const quarter = await resolveCheckInQuarter(req.body.quarter);
  const checkIn = await CheckIn.findOneAndUpdate(
    { goalSheetId: sheet._id, quarter },
    { $set: { goalSheetId: sheet._id, employeeId: sheet.employeeId, managerId: req.user._id, cycleId: sheet.cycleId, quarter, overallComment: req.body.overallComment, goalUpdates: req.body.goalUpdates || [], isCompleted: true, checkInDate: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  for (const update of req.body.goalUpdates || []) {
    const goal = await Goal.findById(update.goalId);
    if (!goal) continue;
    const entry = goal.quarterly.find((q) => q.quarter === quarter) || { quarter, updatedAt: new Date() };
    entry.managerComment = update.managerNote || update.comment;
    if (!goal.quarterly.find((q) => q.quarter === quarter)) goal.quarterly.push(entry);
    await goal.save();
  }
  await createNotification(sheet.employeeId, "CHECKIN_COMPLETED", "Check-in completed", `${quarter} check-in is complete.`, "/checkin");
  res.json({ success: true, data: checkIn });
});

const getCheckInHistory = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findById(req.params.sheetId);
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  if (req.user.role === "employee" && String(sheet.employeeId) !== String(req.user._id)) {
    throw new ApiError(403, "FORBIDDEN", "Cannot view another employee check-in history");
  }
  if (req.user.role === "manager") {
    const employee = await User.findById(sheet.employeeId).select("managerId");
    if (!employee || String(employee.managerId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not your team member");
  }
  const items = await CheckIn.find({ goalSheetId: req.params.sheetId }).sort({ checkInDate: -1 });
  res.json({ success: true, data: items });
});

const getTeamCheckInStatus = asyncHandler(async (req, res) => {
  const employees = await User.find({ managerId: req.user._id });
  const sheets = await GoalSheet.find({ employeeId: { $in: employees.map((e) => e._id) } }).populate("employeeId", "name department employeeId");
  const quarter = await resolveCheckInQuarter(req.query.quarter);
  const done = await CheckIn.find({ goalSheetId: { $in: sheets.map((s) => s._id) }, quarter, isCompleted: true });
  const doneSet = new Set(done.map((d) => String(d.goalSheetId)));
  const rows = sheets.map((sheet) => ({ sheet, employee: sheet.employeeId, currentQuarterDone: doneSet.has(String(sheet._id)) }));
  res.json({ success: true, data: { quarter, rows, completionPercentage: sheets.length ? Math.round((done.length / sheets.length) * 100) : 0 } });
});

export { updateQuarterlyAchievement, getQuarterlyProgress, conductCheckIn, getCheckInHistory, getTeamCheckInStatus };