import Cycle from "../models/Cycle.js";
import User from "../models/User.js";
import GoalSheet from "../models/GoalSheet.js";
import CheckIn from "../models/CheckIn.js";
import EscalationRule from "../models/EscalationRule.js";
import EscalationLog from "../models/EscalationLog.js";
import { sendEscalationEmail, sendCheckInReminderEmail } from "./emailService.js";
import { sendEscalationTeams } from "./teamsNotifier.js";
import { createNotification } from "./notificationService.js";

const MS_PER_DAY = 86400000;

function daysSince(date, today = new Date()) {
  if (!date) return 0;
  return Math.floor((today - new Date(date)) / MS_PER_DAY);
}

async function alreadySentStage(ruleId, affectedUserId, stageTarget, contextKey) {
  return EscalationLog.exists({ ruleId, affectedUserId, stageTarget, contextKey });
}

async function firstAdmin() {
  return User.findOne({ role: "admin", isActive: true }).sort({ createdAt: 1 });
}

async function firstHrOrAdmin() {
  return await User.findOne({ role: "hr", isActive: true }).sort({ createdAt: 1 }) || firstAdmin();
}

async function escalationTarget(employeeOrManager, targetType) {
  if (targetType === "employee") return employeeOrManager;
  if (targetType === "admin") return firstAdmin();
  if (targetType === "hr") return firstHrOrAdmin();
  if (targetType === "skip_level") {
    const manager = employeeOrManager.managerId ? await User.findById(employeeOrManager.managerId) : null;
    if (manager?.managerId) return User.findById(manager.managerId);
    return firstHrOrAdmin();
  }
  if (employeeOrManager.managerId) return User.findById(employeeOrManager.managerId);
  return firstHrOrAdmin();
}

function normalizeChain(rule) {
  if (rule.escalationChain?.length) {
    return [...rule.escalationChain].sort((a, b) => a.afterDays - b.afterDays);
  }
  return [{ target: rule.escalateTo || "manager", afterDays: rule.thresholdDays }];
}

async function createLogAndNotify({ rule, stage, contextKey, affectedUser, target, message, subject, link = "/admin/escalations" }) {
  if (!target?.email) return;
  const isEmployeePortalTarget = ["employee", "manager"].includes(target.role);
  const ctaUrl = isEmployeePortalTarget ? process.env.EMPLOYEE_PORTAL_URL || "" : process.env.ADMIN_PORTAL_URL || "";
  const notificationLink = isEmployeePortalTarget ? link : "/admin/escalations";
  await EscalationLog.create({
    ruleId: rule._id,
    triggerEvent: rule.triggerEvent,
    contextKey,
    stageTarget: stage.target,
    stageAfterDays: stage.afterDays,
    affectedUserId: affectedUser._id,
    escalatedToUserId: target._id,
    message
  });
  await createNotification(target._id, "ESCALATION", subject, message, notificationLink);
  await sendEscalationEmail({
    toEmail: target.email,
    toName: target.name,
    subject,
    body: message,
    ctaLabel: "Open AtomQuest",
    ctaUrl
  });
  await sendEscalationTeams({
    subject,
    message,
    affectedUserName: affectedUser.name,
    targetName: target.name,
    triggerEvent: rule.triggerEvent,
    thresholdDays: stage.afterDays
  });
}

async function runGoalNotSubmitted(rule, cycle, today) {
  const contextKey = `${cycle._id}:goal-submission`;
  const age = daysSince(cycle.goalSettingOpen, today);
  const stages = normalizeChain(rule).filter((stage) => age >= stage.afterDays);
  if (!stages.length) return;
  const employees = await User.find({ role: "employee", isActive: true });
  for (const employee of employees) {
    const sheet = await GoalSheet.findOne({ employeeId: employee._id, cycleId: cycle._id, approvalStatus: { $in: ["submitted", "approved"] } });
    if (sheet) continue;
    for (const stage of stages) {
      if (await alreadySentStage(rule._id, employee._id, stage.target, contextKey)) continue;
      const target = await escalationTarget(employee, stage.target);
      const message = `${employee.name} (Dept: ${employee.department || "Unassigned"}) has not submitted their goals. Cycle opened ${age} days ago. Escalation stage: ${stage.target.replace("_", " ")} after ${stage.afterDays} days.`;
      await createLogAndNotify({ rule, stage, contextKey, affectedUser: employee, target, message, subject: "[AtomQuest] Escalation: goals not submitted", link: stage.target === "employee" ? "/goals" : "/team" });
      if (stage.target === "employee") {
        await sendCheckInReminderEmail({
          userEmail: employee.email,
          userName: employee.name,
          quarter: "Goal Setting",
          windowCloseDate: cycle.goalSettingClose || today
        });
      }
    }
  }
}

async function runGoalNotApproved(rule, cycle, today) {
  const contextKey = `${cycle._id}:goal-approval`;
  const sheets = await GoalSheet.find({ cycleId: cycle._id, approvalStatus: "submitted" }).populate("employeeId");
  for (const sheet of sheets) {
    const age = daysSince(sheet.submittedAt, today);
    const stages = normalizeChain(rule).filter((stage) => age >= stage.afterDays);
    for (const stage of stages) {
      if (await alreadySentStage(rule._id, sheet.employeeId._id, stage.target, contextKey)) continue;
      const target = await escalationTarget(sheet.employeeId, stage.target);
      const message = `${sheet.employeeId.name}'s goal sheet has been awaiting approval for ${age} days. Escalation stage: ${stage.target.replace("_", " ")} after ${stage.afterDays} days.`;
      await createLogAndNotify({ rule, stage, contextKey, affectedUser: sheet.employeeId, target, message, subject: "[AtomQuest] Escalation: goal approval delayed", link: stage.target === "employee" ? "/goals" : "/team" });
    }
  }
}

async function runCheckInNotDone(rule, cycle, today) {
  const currentQuarter = cycle.quarters?.find((quarter) => today >= quarter.windowOpen && today <= quarter.windowClose);
  const age = currentQuarter ? daysSince(currentQuarter.windowOpen, today) : 0;
  const stages = currentQuarter ? normalizeChain(rule).filter((stage) => age >= stage.afterDays) : [];
  if (!currentQuarter || !stages.length) return;
  const contextKey = `${cycle._id}:checkin:${currentQuarter.quarter}`;
  const employees = await User.find({ role: "employee", isActive: true });
  for (const employee of employees) {
    const sheet = await GoalSheet.findOne({ employeeId: employee._id, cycleId: cycle._id, isLocked: true });
    if (!sheet) continue;
    const done = await CheckIn.exists({ employeeId: employee._id, cycleId: cycle._id, quarter: currentQuarter.quarter, isCompleted: true });
    if (done) continue;
    for (const stage of stages) {
      if (await alreadySentStage(rule._id, employee._id, stage.target, contextKey)) continue;
      const target = await escalationTarget(employee, stage.target);
      const message = `${employee.name} has not completed ${currentQuarter.quarter} check-in. Window opened ${age} days ago. Escalation stage: ${stage.target.replace("_", " ")} after ${stage.afterDays} days.`;
      await createLogAndNotify({ rule, stage, contextKey, affectedUser: employee, target, message, subject: `[AtomQuest] Escalation: ${currentQuarter.quarter} check-in pending`, link: stage.target === "employee" ? "/checkin" : "/checkins" });
    }
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

export { runEscalations };