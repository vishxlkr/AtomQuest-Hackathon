const Goal = require("../models/Goal");
const GoalSheet = require("../models/GoalSheet");
const User = require("../models/User");
const CheckIn = require("../models/CheckIn");
const Cycle = require("../models/Cycle");
const asyncHandler = require("../utils/asyncHandler");
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function latestQuarterly(goal) {
  const rows = (goal.quarterly || []).filter((item) => item.progressStatus || typeof item.progressScore === "number");
  return rows.sort((a, b) => QUARTERS.indexOf(b.quarter) - QUARTERS.indexOf(a.quarter))[0];
}

async function activeCycleFilter(req) {
  const activeCycle = await Cycle.findOne({ isActive: true });
  const employeeFilter = {};
  if (req.user.role === "manager") {
    const team = await User.find({ managerId: req.user._id, isActive: true }).select("_id");
    employeeFilter.employeeId = { $in: team.map((employee) => employee._id) };
  }

  const sheetFilter = { ...employeeFilter };
  if (activeCycle) sheetFilter.cycleId = activeCycle._id;
  const sheets = await GoalSheet.find(sheetFilter).select("_id employeeId");
  return {
    activeCycle,
    sheets,
    sheetIds: sheets.map((sheet) => sheet._id),
    employeeIds: sheets.map((sheet) => sheet.employeeId)
  };
}

async function scopedSheets(req) {
  const filter = {};
  if (req.query.cycleId) filter.cycleId = req.query.cycleId;
  else {
    const active = await Cycle.findOne({ isActive: true });
    if (active) filter.cycleId = active._id;
  }
  if (req.query.employeeId) filter.employeeId = req.query.employeeId;
  if (req.user.role === "manager") {
    const team = await User.find({ managerId: req.user._id }).select("_id");
    filter.employeeId = { $in: team.map((u) => u._id) };
  }
  return GoalSheet.find(filter).populate("employeeId", "employeeId name department managerId");
}

const getAchievementReport = asyncHandler(async (req, res) => {
  const sheets = await scopedSheets(req);
  const sheetIds = sheets.map((s) => s._id);
  const goals = await Goal.find({ goalSheetId: { $in: sheetIds } });
  const bySheet = Object.fromEntries(sheets.map((s) => [String(s._id), s]));
  const rows = goals.map((goal) => {
    const employee = bySheet[String(goal.goalSheetId)]?.employeeId;
    const quarterly = req.query.quarter ? goal.quarterly.filter((q) => q.quarter === req.query.quarter) : goal.quarterly;
    return { employee: { name: employee?.name, employeeId: employee?.employeeId, department: employee?.department }, goal: { title: goal.title, thrustArea: goal.thrustArea, uomType: goal.uomType, target: goal.target, weightage: goal.weightage }, quarterly };
  });
  res.json({ success: true, data: rows });
});

function csv(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

const exportAchievementCSV = asyncHandler(async (req, res) => {
  const sheets = await scopedSheets(req);
  const goals = await Goal.find({ goalSheetId: { $in: sheets.map((s) => s._id) } });
  const bySheet = Object.fromEntries(sheets.map((s) => [String(s._id), s]));
  const headers = ["Employee ID", "Name", "Department", "Goal Title", "Thrust Area", "UoM", "Target", "Weightage", "Q1 Achievement", "Q1 Score", "Q2 Achievement", "Q2 Score", "Q3 Achievement", "Q3 Score", "Q4 Achievement", "Q4 Score", "Overall Progress Status"];
  const lines = [headers.map(csv).join(",")];
  goals.forEach((goal) => {
    const employee = bySheet[String(goal.goalSheetId)]?.employeeId || {};
    const q = Object.fromEntries(goal.quarterly.map((item) => [item.quarter, item]));
    const status = goal.quarterly.at(-1)?.progressStatus || "not_started";
    lines.push([employee.employeeId, employee.name, employee.department, goal.title, goal.thrustArea, goal.uomType, goal.target, goal.weightage, q.Q1?.actualAchievement, q.Q1?.progressScore, q.Q2?.actualAchievement, q.Q2?.progressScore, q.Q3?.actualAchievement, q.Q3?.progressScore, q.Q4?.actualAchievement, q.Q4?.progressScore, status].map(csv).join(","));
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=achievement_report.csv");
  res.send(lines.join("\n"));
});

const getQoQTrend = asyncHandler(async (req, res) => {
  const { activeCycle, sheetIds, employeeIds } = await activeCycleFilter(req);
  const [goals, employees] = await Promise.all([
    Goal.find({ goalSheetId: { $in: sheetIds } }),
    User.find({ _id: { $in: employeeIds } }).select("employeeId name department managerId")
  ]);

  const orgTrend = QUARTERS.map((quarter) => {
    const entries = goals.map((goal) => goal.quarterly?.find((item) => item.quarter === quarter)).filter((item) => item && typeof item.progressScore === "number");
    const total = entries.length;
    return {
      quarter,
      avgScore: total ? round(entries.reduce((sum, item) => sum + item.progressScore, 0) / total) : 0,
      completionRate: total ? round((entries.filter((item) => item.progressStatus === "completed").length / total) * 100) : 0,
      onTrackRate: total ? round((entries.filter((item) => item.progressStatus === "on_track").length / total) * 100) : 0
    };
  });

  const managerMap = {};
  if (employees.length) {
    const managers = await User.find({ _id: { $in: employees.map((employee) => employee.managerId).filter(Boolean) } }).select("name");
    managers.forEach((manager) => { managerMap[String(manager._id)] = manager.name; });
  }

  const employeeTrends = employees.map((employee) => {
    const employeeGoals = goals.filter((goal) => String(goal.employeeId) === String(employee._id));
    const row = {
      employeeId: employee.employeeId,
      userId: employee._id,
      name: employee.name,
      department: employee.department || "Unassigned",
      manager: employee.managerId ? managerMap[String(employee.managerId)] || "" : ""
    };
    QUARTERS.forEach((quarter) => {
      const scores = employeeGoals
        .map((goal) => goal.quarterly?.find((item) => item.quarter === quarter)?.progressScore)
        .filter((score) => typeof score === "number");
      row[quarter] = scores.length ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
    });
    return row;
  });

  res.json({ success: true, data: { activeCycle, orgTrend, employeeTrends } });
});

const getGoalDistribution = asyncHandler(async (req, res) => {
  const { sheetIds } = await activeCycleFilter(req);
  const goals = await Goal.find({ goalSheetId: { $in: sheetIds } });

  const thrust = {};
  const uom = {};
  const status = {};
  const weight = {};
  goals.forEach((goal) => {
    const thrustArea = goal.thrustArea || "Unassigned";
    const scoreRows = (goal.quarterly || []).filter((item) => typeof item.progressScore === "number");
    const avgScore = scoreRows.length ? scoreRows.reduce((sum, item) => sum + item.progressScore, 0) / scoreRows.length : 0;
    thrust[thrustArea] ||= { name: thrustArea, count: 0, scoreTotal: 0 };
    thrust[thrustArea].count += 1;
    thrust[thrustArea].scoreTotal += avgScore;

    const uomType = goal.uomType || "unknown";
    uom[uomType] ||= { name: uomType, count: 0 };
    uom[uomType].count += 1;

    const latest = latestQuarterly(goal);
    const progressStatus = latest?.progressStatus || "not_started";
    status[progressStatus] ||= { name: progressStatus, count: 0 };
    status[progressStatus].count += 1;

    weight[thrustArea] ||= { name: thrustArea, total: 0, count: 0 };
    weight[thrustArea].total += Number(goal.weightage || 0);
    weight[thrustArea].count += 1;
  });

  const byThrustArea = Object.values(thrust).map((item) => ({ name: item.name, count: item.count, avgScore: item.count ? round(item.scoreTotal / item.count) : 0 }));
  const byUomType = Object.values(uom);
  const byStatus = Object.values(status);
  const weightageDistribution = Object.values(weight).map((item) => ({ name: item.name, avgWeightage: item.count ? round(item.total / item.count) : 0 }));
  res.json({ success: true, data: { byThrustArea, byUomType, byStatus, weightageDistribution } });
});

const getDepartmentHeatmap = asyncHandler(async (req, res) => {
  const activeCycle = await Cycle.findOne({ isActive: true });
  const employees = await User.find({ role: "employee", isActive: true }).select("department");
  const today = new Date();
  const rowsByDepartment = {};
  employees.forEach((employee) => {
    const department = employee.department || "Unassigned";
    rowsByDepartment[department] ||= { department, employeeIds: [] };
    rowsByDepartment[department].employeeIds.push(employee._id);
  });

  const rows = [];
  for (const departmentRow of Object.values(rowsByDepartment)) {
    const row = { department: departmentRow.department };
    for (const quarter of QUARTERS) {
      const quarterWindow = activeCycle?.quarters?.find((item) => item.quarter === quarter);
      if (quarterWindow && today < quarterWindow.windowOpen) {
        row[quarter] = null;
        continue;
      }
      const done = await CheckIn.countDocuments({ cycleId: activeCycle?._id, quarter, employeeId: { $in: departmentRow.employeeIds }, isCompleted: true });
      row[quarter] = departmentRow.employeeIds.length ? round((done / departmentRow.employeeIds.length) * 100, 0) : 0;
    }
    rows.push(row);
  }
  res.json({ success: true, data: rows });
});

const getManagerEffectiveness = asyncHandler(async (req, res) => {
  const activeCycle = await Cycle.findOne({ isActive: true });
  const managers = await User.find({ role: "manager", isActive: true });
  const rows = [];
  for (const manager of managers) {
    const team = await User.find({ managerId: manager._id, isActive: true });
    const sheets = await GoalSheet.find({ cycleId: activeCycle?._id, employeeId: { $in: team.map((u) => u._id) } });
    const completedCheckIns = await CheckIn.find({ managerId: manager._id, cycleId: activeCycle?._id, isCompleted: true });
    const checkIns = {};
    QUARTERS.forEach((quarter) => { checkIns[quarter] = completedCheckIns.some((checkIn) => checkIn.quarter === quarter); });
    const approvalDurations = sheets.filter((s) => s.submittedAt && s.approvedAt).map((s) => (s.approvedAt - s.submittedAt) / 86400000);
    const approved = sheets.filter((sheet) => sheet.approvalStatus === "approved").length;
    rows.push({
      managerId: manager._id,
      managerName: manager.name,
      department: manager.department || "Unassigned",
      teamSize: team.length,
      checkIns,
      checkInsDone: completedCheckIns.length,
      checkInCompletionRate: team.length ? round((completedCheckIns.length / (team.length * 4)) * 100) : 0,
      approvalAvgDays: approvalDurations.length ? round(approvalDurations.reduce((a, b) => a + b, 0) / approvalDurations.length) : 0,
      submissionRate: team.length ? round((approved / team.length) * 100) : 0
    });
  }
  res.json({ success: true, data: rows });
});

const getCompletionDashboard = asyncHandler(async (req, res) => {
  const cycle = await Cycle.findOne({ isActive: true });
  let employees = await User.find({ role: "employee", isActive: true });
  if (req.user.role === "manager") employees = employees.filter((employee) => String(employee.managerId) === String(req.user._id));
  const employeeIds = employees.map((employee) => employee._id);
  const sheets = await GoalSheet.find({ cycleId: cycle?._id, employeeId: { $in: employeeIds } });
  const statusCount = (status) => sheets.filter((sheet) => sheet.approvalStatus === status).length;
  const quarterlyCompletion = {};
  for (const quarter of ["Q1", "Q2", "Q3", "Q4"]) {
    quarterlyCompletion[quarter] = {
      done: await CheckIn.countDocuments({ cycleId: cycle?._id, quarter, isCompleted: true, employeeId: { $in: employeeIds } }),
      total: employees.length
    };
  }
  res.json({
    success: true,
    data: {
      activeCycle: cycle,
      total: sheets.length,
      totalEmployees: employees.length,
      submitted: statusCount("submitted"),
      approved: statusCount("approved"),
      returned: statusCount("returned"),
      draft: Math.max(0, employees.length - sheets.filter((sheet) => ["submitted", "approved", "returned"].includes(sheet.approvalStatus)).length),
      goalsSubmitted: sheets.filter((sheet) => ["submitted", "approved"].includes(sheet.approvalStatus)).length,
      goalsApproved: statusCount("approved"),
      goalsPending: Math.max(0, employees.length - sheets.filter((sheet) => ["submitted", "approved"].includes(sheet.approvalStatus)).length),
      quarterlyCompletion
    }
  });
});

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const { activeCycle, sheetIds, employeeIds } = await activeCycleFilter(req);
  const [goals, employees] = await Promise.all([
    Goal.find({ goalSheetId: { $in: sheetIds } }),
    User.find({ _id: { $in: employeeIds } }).select("department")
  ]);
  const quarterlyTrend = QUARTERS.map((quarter) => {
    const entries = goals.map((goal) => goal.quarterly?.find((item) => item.quarter === quarter)).filter((item) => item && typeof item.progressScore === "number");
    return { quarter, avgScore: entries.length ? round(entries.reduce((sum, item) => sum + item.progressScore, 0) / entries.length) : 0, completionRate: entries.length ? round((entries.filter((item) => item.progressStatus === "completed").length / entries.length) * 100) : 0 };
  });
  res.json({
    success: true,
    data: {
      activeCycle,
      goalDistribution: {},
      quarterlyTrend,
      managerEffectiveness: [],
      departmentHeatmap: []
    }
  });
});

module.exports = { getAchievementReport, exportAchievementCSV, getQoQTrend, getGoalDistribution, getDepartmentHeatmap, getManagerEffectiveness, getCompletionDashboard, getAnalyticsOverview };
