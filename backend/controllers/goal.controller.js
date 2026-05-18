import Goal from "../models/Goal.js";
import GoalSheet from "../models/GoalSheet.js";
import Cycle from "../models/Cycle.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logAudit } from "../utils/auditLogger.js";
import { createNotification } from "../utils/notificationService.js";
import { calculateProgressScore } from "../utils/progressScore.js";
import { sendGoalSubmittedEmail, sendGoalApprovedEmail, sendGoalReturnedEmail } from "../utils/emailService.js";
import { sendGoalSubmittedTeams, sendGoalApprovedTeams, sendGoalReturnedTeams } from "../utils/teamsNotifier.js";

async function activeCycle() {
  const cycle = await Cycle.findOne({ isActive: true });
  if (!cycle) throw new ApiError(404, "NO_ACTIVE_CYCLE", "No active cycle found");
  return cycle;
}

async function recalcTotal(goalSheetId) {
  const goals = await Goal.find({ goalSheetId });
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  await GoalSheet.findByIdAndUpdate(goalSheetId, { totalWeightage });
  return { goals, totalWeightage };
}

async function attachSharedGoalCounts(sheet) {
  const sheetObject = sheet.toObject({ virtuals: true });
  const sharedLinkIds = [...new Set((sheetObject.goals || []).map((goal) => goal.sharedLinkId).filter(Boolean))];
  if (!sharedLinkIds.length) return sheetObject;

  const counts = await Goal.aggregate([
    { $match: { sharedLinkId: { $in: sharedLinkIds } } },
    { $group: { _id: "$sharedLinkId", count: { $sum: 1 } } }
  ]);
  const countMap = counts.reduce((map, item) => ({ ...map, [item._id]: item.count }), {});
  sheetObject.goals = (sheetObject.goals || []).map((goal) => ({
    ...goal,
    sharedLinkedCount: goal.sharedLinkId ? Math.max(Number(countMap[goal.sharedLinkId] || 1) - 1, 0) : 0
  }));
  return sheetObject;
}

function validateGoalSheetRules(goals) {
  if (!goals.length) throw new ApiError(400, "NO_GOALS", "At least one goal is required");
  if (goals.length > 8) throw new ApiError(400, "MAX_GOALS", "Maximum 8 goals allowed");
  if (goals.some((goal) => Number(goal.weightage) < 10)) throw new ApiError(400, "MIN_WEIGHTAGE", "Each goal needs minimum 10% weightage");
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  if (total !== 100) throw new ApiError(400, "TOTAL_WEIGHTAGE", "Total weightage must equal exactly 100%");
}

function isEmployeeEditableSheet(sheet) {
  return sheet && ["draft", "returned"].includes(sheet.approvalStatus) && !sheet.isLocked;
}

const createGoalSheet = asyncHandler(async (req, res) => {
  const cycle = await activeCycle();
  let sheet = await GoalSheet.findOne({ employeeId: req.user._id, cycleId: cycle._id });
  if (!sheet) sheet = await GoalSheet.create({ employeeId: req.user._id, cycleId: cycle._id, approvalStatus: "draft" });
  res.status(201).json({ success: true, data: sheet });
});

const getOrCreateSheet = asyncHandler(async (req, res) => {
  const cycle = await Cycle.findOne({ isActive: true });
  if (!cycle) {
    return res.json({
      success: true,
      data: null,
      meta: { code: "NO_ACTIVE_CYCLE", message: "No active cycle found" }
    });
  }
  let sheet = await GoalSheet.findOne({ employeeId: req.user._id, cycleId: cycle._id });
  if (!sheet) sheet = await GoalSheet.create({ employeeId: req.user._id, cycleId: cycle._id, approvalStatus: "draft" });
  sheet = await GoalSheet.findById(sheet._id).populate("goals");
  res.json({ success: true, data: await attachSharedGoalCounts(sheet) });
});

const getMyGoalSheet = getOrCreateSheet;

const submitGoalSheet = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findOne({ _id: req.params.sheetId, employeeId: req.user._id });
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  if (!isEmployeeEditableSheet(sheet)) throw new ApiError(400, "SHEET_LOCKED", "Only draft or returned goal sheets can be submitted");
  const goals = await Goal.find({ goalSheetId: sheet._id });
  validateGoalSheetRules(goals);
  sheet.approvalStatus = "submitted";
  sheet.submittedAt = new Date();
  sheet.isLocked = false;
  await sheet.save();
  const employee = await User.findById(sheet.employeeId).populate("managerId");
  if (employee?.managerId) {
    await createNotification(employee.managerId._id, "GOAL_SUBMITTED", "Goal sheet submitted", `${employee.name} submitted goals for approval.`, `/team/${sheet._id}`);
    const cycle = await Cycle.findById(sheet.cycleId).select("name");
    try {
      await sendGoalSubmittedEmail({
        managerEmail: employee.managerId.email,
        managerName: employee.managerId.name,
        employeeName: employee.name,
        cycleYear: cycle?.name || "Current Cycle"
      });
      await sendGoalSubmittedTeams(employee.name, employee.managerId.name, cycle?.name || "Current Cycle");
    } catch (err) {
      console.error("Goal submission notification failed:", err.message);
    }
  }
  await logAudit({ entityType: "goalsheet", entityId: sheet._id, action: "GOALSHEET_SUBMITTED", changedBy: req.user._id, newValue: sheet });
  res.json({ success: true, data: sheet });
});

const getTeamGoalSheets = asyncHandler(async (req, res) => {
  const employees = await User.find({ managerId: req.user._id }).select("_id");
  const sheets = await GoalSheet.find({ employeeId: { $in: employees.map((e) => e._id) }, approvalStatus: { $in: ["submitted", "approved", "returned", "draft"] } })
    .populate("employeeId", "name employeeId department email")
    .populate("goals");
  res.json({ success: true, data: sheets });
});

const approveGoalSheet = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findById(req.params.sheetId).populate("employeeId");
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  const employee = await User.findById(sheet.employeeId._id || sheet.employeeId);
  if (req.user.role === "manager" && String(employee.managerId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not your team member");
  const goals = await Goal.find({ goalSheetId: sheet._id });
  validateGoalSheetRules(goals);
  sheet.approvalStatus = "approved";
  sheet.isLocked = true;
  sheet.lockedAt = new Date();
  sheet.approvedAt = new Date();
  sheet.approvedBy = req.user._id;
  await sheet.save();
  await Goal.updateMany({ goalSheetId: sheet._id }, { status: "locked" });
  await createNotification(employee._id, "GOAL_APPROVED", "Goals approved", "Your goals are now locked for the cycle.", "/goals");
  const manager = await User.findById(req.user._id).select("name");
  const cycle = await Cycle.findById(sheet.cycleId).select("name");
  try {
    await sendGoalApprovedEmail({
      employeeEmail: employee.email,
      employeeName: employee.name,
      managerName: manager?.name || req.user.name || "Your manager",
      cycleYear: cycle?.name || "Current Cycle"
    });
    await sendGoalApprovedTeams(employee.name, cycle?.name || "Current Cycle");
  } catch (err) {
    console.error("Goal approval notification failed:", err.message);
  }
  await logAudit({ entityType: "goalsheet", entityId: sheet._id, action: "GOALSHEET_APPROVED", changedBy: req.user._id, newValue: sheet });
  res.json({ success: true, data: sheet });
});

const returnGoalSheet = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findById(req.params.sheetId);
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  const employee = await User.findById(sheet.employeeId);
  if (!employee) throw new ApiError(404, "EMPLOYEE_NOT_FOUND", "Employee not found");
  if (req.user.role === "manager" && String(employee.managerId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not your team member");
  sheet.approvalStatus = "returned";
  sheet.managerRemarks = req.body.remarks || req.body.managerRemarks || "";
  sheet.isLocked = false;
  await sheet.save();
  await createNotification(sheet.employeeId, "GOAL_RETURNED", "Goals returned", sheet.managerRemarks, "/goals");
  const manager = await User.findById(req.user._id).select("name");
  const cycle = await Cycle.findById(sheet.cycleId).select("name");
  try {
    await sendGoalReturnedEmail({
      employeeEmail: employee.email,
      employeeName: employee.name,
      managerName: manager?.name || req.user.name || "Your manager",
      remarks: sheet.managerRemarks,
      cycleYear: cycle?.name || "Current Cycle"
    });
    await sendGoalReturnedTeams(employee.name, manager?.name || req.user.name || "Your manager", sheet.managerRemarks, cycle?.name || "Current Cycle");
  } catch (err) {
    console.error("Goal return notification failed:", err.message);
  }
  await logAudit({ entityType: "goalsheet", entityId: sheet._id, action: "GOALSHEET_RETURNED", changedBy: req.user._id, reason: sheet.managerRemarks });
  res.json({ success: true, data: sheet });
});

const addGoal = asyncHandler(async (req, res) => {
  const cycle = await activeCycle();
  let sheet = req.params.sheetId
    ? await GoalSheet.findOne({ _id: req.params.sheetId, employeeId: req.user._id })
    : await GoalSheet.findOne({ employeeId: req.user._id, cycleId: cycle._id });
  if (!sheet && !req.params.sheetId) sheet = await GoalSheet.create({ employeeId: req.user._id, cycleId: cycle._id, approvalStatus: "draft" });
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  if (!isEmployeeEditableSheet(sheet)) throw new ApiError(400, "SHEET_LOCKED", "Goal sheet cannot be edited");
  const existingGoals = await Goal.find({ goalSheetId: sheet._id }).select("weightage");
  if (existingGoals.length >= 8) throw new ApiError(400, "MAX_GOALS", "Maximum 8 goals allowed");
  const currentWeightage = existingGoals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  const nextWeightage = Number(req.body.weightage || 0);
  if (currentWeightage + nextWeightage > 100) {
    throw new ApiError(400, "TOTAL_WEIGHTAGE_EXCEEDED", `Only ${100 - currentWeightage}% weightage is available`);
  }
  const goal = await Goal.create({ ...req.body, goalSheetId: sheet._id, employeeId: req.user._id });
  const { totalWeightage } = await recalcTotal(sheet._id);
  res.status(201).json({ success: true, data: { goal, totalWeightage } });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);
  if (!goal) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found");
  const sheet = await GoalSheet.findById(goal.goalSheetId);
  if (req.user.role === "employee" && String(sheet.employeeId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Cannot update another employee goal");
  if (req.user.role === "employee" && !isEmployeeEditableSheet(sheet)) throw new ApiError(400, "SHEET_LOCKED", "Only draft or returned goal sheets can be edited");
  if (sheet.isLocked && req.user.role !== "admin") throw new ApiError(400, "SHEET_LOCKED", "Only admin can edit a locked sheet");
  const payload = { ...req.body };
  if (goal.isShared && req.user.role !== "admin") {
    Object.keys(payload).forEach((key) => { if (key !== "weightage") delete payload[key]; });
  }
  Object.assign(goal, payload);
  await goal.save();
  await recalcTotal(sheet._id);
  await logAudit({ entityType: "goal", entityId: goal._id, action: "GOAL_UPDATED", changedBy: req.user._id, newValue: payload });
  res.json({ success: true, data: goal });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.goalId);
  if (!goal) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found");
  const sheet = await GoalSheet.findById(goal.goalSheetId);
  if (req.user.role === "employee" && String(sheet.employeeId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Cannot delete another employee goal");
  if (req.user.role === "employee" && !isEmployeeEditableSheet(sheet)) throw new ApiError(400, "SHEET_LOCKED", "Only draft or returned goal sheets can be edited");
  if (sheet.isLocked && req.user.role !== "admin") throw new ApiError(400, "SHEET_LOCKED", "Goal sheet is locked");
  await goal.deleteOne();
  const { totalWeightage } = await recalcTotal(sheet._id);
  res.json({ success: true, data: { totalWeightage } });
});

const managerUpdateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.goalId || req.params.id);
  if (!goal) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found");
  const sheet = await GoalSheet.findById(goal.goalSheetId);
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  if (sheet.approvalStatus !== "submitted") throw new ApiError(400, "SHEET_NOT_SUBMITTED", "Only submitted sheets can be edited by manager");
  const employee = await User.findById(sheet.employeeId);
  if (req.user.role === "manager" && String(employee.managerId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Not your team member");
  const payload = {};
  if (req.body.target !== undefined) payload.target = req.body.target;
  if (req.body.weightage !== undefined) payload.weightage = req.body.weightage;
  Object.assign(goal, payload);
  await goal.save();
  const { totalWeightage } = await recalcTotal(sheet._id);
  await logAudit({ entityType: "goal", entityId: goal._id, action: "MANAGER_GOAL_UPDATED", changedBy: req.user._id, newValue: payload });
  res.json({ success: true, data: { goal, totalWeightage } });
});

const updateAchievement = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.goalId || req.params.id || req.body.goalId);
  if (!goal) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found");
  const sheet = await GoalSheet.findById(goal.goalSheetId);
  if (!sheet || String(sheet.employeeId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Cannot update another employee goal");
  const quarter = req.body.quarter;
  if (!quarter) throw new ApiError(400, "QUARTER_REQUIRED", "Quarter is required");
  const progressScore = calculateProgressScore(goal.uomType, goal.target, req.body.actualAchievement, goal.target);
  const next = {
    quarter,
    plannedTarget: goal.target,
    actualAchievement: req.body.actualAchievement,
    progressStatus: req.body.progressStatus || "on_track",
    progressScore,
    updatedAt: new Date()
  };
  const existingIndex = goal.quarterly.findIndex((item) => item.quarter === quarter);
  if (existingIndex >= 0) goal.quarterly.set(existingIndex, { ...goal.quarterly[existingIndex].toObject(), ...next });
  else goal.quarterly.push(next);
  await goal.save();

  let syncedTo = 0;
  const isThisPrimaryOwner = goal.sharedLinkId && goal.primaryOwnerId && String(goal.primaryOwnerId) === String(req.user._id);
  if (isThisPrimaryOwner) {
    const linkedGoals = await Goal.find({ sharedLinkId: goal.sharedLinkId, _id: { $ne: goal._id } });
    await Promise.all(linkedGoals.map(async (linkedGoal) => {
      const linkedIndex = linkedGoal.quarterly.findIndex((item) => item.quarter === quarter);
      const syncData = {
        quarter,
        plannedTarget: linkedGoal.target,
        actualAchievement: req.body.actualAchievement,
        progressStatus: req.body.progressStatus || "on_track",
        progressScore,
        updatedAt: new Date(),
        managerComment: linkedIndex >= 0 ? linkedGoal.quarterly[linkedIndex].managerComment : undefined
      };
      if (linkedIndex >= 0) linkedGoal.quarterly.set(linkedIndex, { ...linkedGoal.quarterly[linkedIndex].toObject(), ...syncData });
      else linkedGoal.quarterly.push(syncData);
      await linkedGoal.save();
    }));
    syncedTo = linkedGoals.length;
    console.log(`[SharedGoalSync] Synced achievement to ${syncedTo} linked goals`);
  }

  await logAudit({ entityType: "goal", entityId: goal._id, action: "QUARTERLY_ACHIEVEMENT_UPDATED", changedBy: req.user._id, newValue: next });
  res.json({ success: true, data: goal, syncedTo });
});

const pushSharedGoal = asyncHandler(async (req, res) => {
  const cycle = await activeCycle();
  const created = [];
  const employeeIds = req.body.employeeIds || req.body.targetEmployeeIds || [];
  const sharedLinkId = uuidv4();
  const designatedPrimaryOwnerId = req.body.primaryOwnerId || req.user._id;
  for (const employeeId of employeeIds) {
    let sheet = await GoalSheet.findOne({ employeeId, cycleId: cycle._id });
    if (!sheet) sheet = await GoalSheet.create({ employeeId, cycleId: cycle._id });
    created.push(await Goal.create({
      ...req.body,
      employeeIds: undefined,
      targetEmployeeIds: undefined,
      employeeId,
      goalSheetId: sheet._id,
      isShared: true,
      sharedBy: req.user._id,
      sharedLinkId,
      primaryOwnerId: designatedPrimaryOwnerId
    }));
    await recalcTotal(sheet._id);
    await createNotification(employeeId, "SHARED_GOAL", "Shared goal assigned", req.body.title, "/goals");
  }
  res.status(201).json({ success: true, data: { pushed: created.length, employeeIds, sharedLinkId, goals: created } });
});

const syncSharedGoalAchievement = asyncHandler(async (req, res) => {
  const source = await Goal.findById(req.params.goalId);
  if (!source) throw new ApiError(404, "GOAL_NOT_FOUND", "Goal not found");
  if (!source.sharedLinkId) throw new ApiError(400, "NOT_LINKED_SHARED_GOAL", "Goal is not linked to a shared goal group");
  if (source.primaryOwnerId && String(source.primaryOwnerId) !== String(req.user._id)) throw new ApiError(403, "FORBIDDEN", "Only the primary owner can sync shared achievements");
  const result = await Goal.updateMany({ sharedLinkId: source.sharedLinkId, _id: { $ne: source._id } }, { quarterly: source.quarterly });
  res.json({ success: true, syncedTo: result.modifiedCount || 0 });
});

const unlockSheet = asyncHandler(async (req, res) => {
  const sheet = await GoalSheet.findById(req.params.sheetId || req.params.id);
  if (!sheet) throw new ApiError(404, "SHEET_NOT_FOUND", "Goal sheet not found");
  sheet.isLocked = false;
  sheet.unlockedBy = req.user._id;
  await sheet.save();
  await logAudit({ entityType: "goalsheet", entityId: sheet._id, action: "SHEET_UNLOCKED", changedBy: req.user._id, reason: req.body.reason });
  res.json({ success: true, data: sheet });
});

export { createGoalSheet, getOrCreateSheet, getMyGoalSheet, submitGoalSheet, getTeamGoalSheets, approveGoalSheet, returnGoalSheet, addGoal, updateGoal, deleteGoal, managerUpdateGoal, updateAchievement, pushSharedGoal, syncSharedGoalAchievement, unlockSheet, validateGoalSheetRules };
