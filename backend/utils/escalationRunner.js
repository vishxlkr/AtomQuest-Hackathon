const Cycle = require("../models/Cycle");
const User = require("../models/User");
const GoalSheet = require("../models/GoalSheet");
const CheckIn = require("../models/CheckIn");
const EscalationRule = require("../models/EscalationRule");
const EscalationLog = require("../models/EscalationLog");
const { sendEscalationEmail, sendCheckInReminderEmail } = require("./emailService");

const MS_PER_DAY = 86400000;

function daysSince(date, today = new Date()) {
  if (!date) return 0;
  return Math.floor((today - new Date(date)) / MS_PER_DAY);
}

function startOfToday(today = new Date()) {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

async function alreadySentToday(ruleId, affectedUserId, today = new Date()) {
  return EscalationLog.exists({ ruleId, affectedUserId, triggeredAt: { $gte: startOfToday(today) } });
}

async function firstAdmin() {
  return User.findOne({ role: "admin", isActive: true }).sort({ createdAt: 1 });
}

async function escalationTarget(employeeOrManager, escalateTo) {
  if (escalateTo === "admin") return firstAdmin();
  if (escalateTo === "skip_level") {
    const manager = employeeOrManager.managerId ? await User.findById(employeeOrManager.managerId) : null;
    if (manager?.managerId) return User.findById(manager.managerId);
    return firstAdmin();
  }
  if (employeeOrManager.managerId) return User.findById(employeeOrManager.managerId);
  return firstAdmin();
}

async function createLogAndEmail({ rule, affectedUser, target, message, subject }) {
  if (!target?.email) return;
  await EscalationLog.create({
    ruleId: rule._id,
    triggerEvent: rule.triggerEvent,
    affectedUserId: affectedUser._id,
    escalatedToUserId: target._id,
    message
  });
  await sendEscalationEmail({
    toEmail: target.email,
    toName: target.name,
    subject,
    body: message,
    ctaLabel: "Open AtomQuest",
    ctaUrl: process.env.ADMIN_PORTAL_URL || ""
  });
}

async function runGoalNotSubmitted(rule, cycle, today) {
  if (daysSince(cycle.goalSettingOpen, today) < rule.thresholdDays) return;
  const employees = await User.find({ role: "employee", isActive: true });
  for (const employee of employees) {
    const sheet = await GoalSheet.findOne({ employeeId: employee._id, cycleId: cycle._id, approvalStatus: { $in: ["submitted", "approved"] } });
    if (sheet || await alreadySentToday(rule._id, employee._id, today)) continue;
    const target = await escalationTarget(employee, rule.escalateTo);
    const age = daysSince(cycle.goalSettingOpen, today);
    const message = `${employee.name} (Dept: ${employee.department || "Unassigned"}) has not submitted their goals. Cycle opened ${age} days ago. Threshold: ${rule.thresholdDays} days.`;
    await createLogAndEmail({ rule, affectedUser: employee, target, message, subject: "[AtomQuest] Escalation: goals not submitted" });
    await sendCheckInReminderEmail({
      userEmail: employee.email,
      userName: employee.name,
      quarter: "Goal Setting",
      windowCloseDate: cycle.goalSettingClose || today
    });
  }
}

async function runGoalNotApproved(rule, cycle, today) {
  const sheets = await GoalSheet.find({ cycleId: cycle._id, approvalStatus: "submitted" }).populate("employeeId");
  for (const sheet of sheets) {
    if (daysSince(sheet.submittedAt, today) < rule.thresholdDays || await alreadySentToday(rule._id, sheet.employeeId._id, today)) continue;
    const target = await escalationTarget(sheet.employeeId, rule.escalateTo);
    const message = `${sheet.employeeId.name}'s goal sheet has been awaiting approval for ${daysSince(sheet.submittedAt, today)} days. Threshold: ${rule.thresholdDays} days.`;
    await createLogAndEmail({ rule, affectedUser: sheet.employeeId, target, message, subject: "[AtomQuest] Escalation: goal approval delayed" });
  }
}

async function runCheckInNotDone(rule, cycle, today) {
  const currentQuarter = cycle.quarters?.find((quarter) => today >= quarter.windowOpen && today <= quarter.windowClose);
  if (!currentQuarter || daysSince(currentQuarter.windowOpen, today) < rule.thresholdDays) return;
  const managers = await User.find({ role: "manager", isActive: true });
  for (const manager of managers) {
    const team = await User.find({ role: "employee", managerId: manager._id, isActive: true });
    const missing = [];
    for (const employee of team) {
      const done = await CheckIn.exists({ employeeId: employee._id, cycleId: cycle._id, quarter: currentQuarter.quarter, isCompleted: true });
      if (!done) missing.push(employee);
    }
    if (!missing.length || await alreadySentToday(rule._id, manager._id, today)) continue;
    const target = rule.escalateTo === "admin" || rule.escalateTo === "skip_level" ? await escalationTarget(manager, rule.escalateTo) : manager;
    const message = `${missing.length} team member(s) under ${manager.name} have not completed ${currentQuarter.quarter} check-in. Threshold: ${rule.thresholdDays} days.`;
    await createLogAndEmail({ rule, affectedUser: manager, target, message, subject: `[AtomQuest] Escalation: ${currentQuarter.quarter} check-ins pending` });
  }
}

async function runEscalations() {
  const [rules, cycle] = await Promise.all([
    EscalationRule.find({ isActive: true }),
    Cycle.findOne({ isActive: true })
  ]);
  if (!cycle) return;
  const today = new Date();
  for (const rule of rules) {
    if (rule.triggerEvent === "GOAL_NOT_SUBMITTED") await runGoalNotSubmitted(rule, cycle, today);
    if (rule.triggerEvent === "GOAL_NOT_APPROVED") await runGoalNotApproved(rule, cycle, today);
    if (rule.triggerEvent === "CHECKIN_NOT_DONE") await runCheckInNotDone(rule, cycle, today);
  }
}

module.exports = { runEscalations };
