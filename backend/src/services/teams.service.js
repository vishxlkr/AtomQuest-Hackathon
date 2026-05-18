import axios from "axios";

const DEFAULT_APP_NAME = "AtomQuest Goal Portal";

function getPortalUrl(path = "", portal = "employee") {
  const baseUrl = portal === "admin" ? process.env.ADMIN_PORTAL_URL : process.env.EMPLOYEE_PORTAL_URL;
  if (!baseUrl) return "";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function normalizeFact(fact) {
  return {
    title: String(fact.title || ""),
    value: String(fact.value ?? "-")
  };
}

function buildAdaptiveCard({ title, text, facts = [], ctaLabel, ctaUrl }) {
  const body = [
    { type: "TextBlock", text: DEFAULT_APP_NAME, weight: "Bolder", size: "Small", color: "Accent" },
    { type: "TextBlock", text: title, weight: "Bolder", size: "Medium", wrap: true }
  ];

  if (text) body.push({ type: "TextBlock", text, wrap: true, color: "Default" });
  if (facts.length) body.push({ type: "FactSet", facts: facts.map(normalizeFact) });

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body,
          actions: ctaUrl ? [{ type: "Action.OpenUrl", title: ctaLabel || "Open AtomQuest", url: ctaUrl }] : []
        }
      }
    ]
  };
}

async function sendTeamsNotification({ title, text, facts = [], ctaLabel, ctaUrl }) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("Teams notification skipped:", title);
    return { skipped: true };
  }

  const payload = buildAdaptiveCard({ title, text, facts, ctaLabel, ctaUrl });
  const response = await axios.post(webhookUrl, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 10000
  });

  return { skipped: false, status: response.status, data: response.data };
}

async function safeSendTeamsNotification(message) {
  try {
    return await sendTeamsNotification(message);
  } catch (error) {
    console.error("Teams notification failed:", error.response?.data || error.message);
    return { skipped: false, error: error.message };
  }
}

function sendGoalSubmittedTeams(employeeName, managerName, cycleYear) {
  return safeSendTeamsNotification({
    title: "Goal Sheet Submitted for Review",
    text: `${employeeName} has submitted their goal sheet and is awaiting your approval.`,
    facts: [
      { title: "Employee", value: employeeName },
      { title: "Manager", value: managerName || "-" },
      { title: "Cycle", value: cycleYear }
    ],
    ctaLabel: "Review in AtomQuest",
    ctaUrl: getPortalUrl("/team")
  });
}

function sendGoalApprovedTeams(employeeName, cycleYear) {
  return safeSendTeamsNotification({
    title: "Goal Sheet Approved",
    text: `Your goal sheet for ${cycleYear} has been approved. Your goals are now locked.`,
    facts: [
      { title: "Employee", value: employeeName },
      { title: "Cycle", value: cycleYear }
    ],
    ctaLabel: "View My Goals",
    ctaUrl: getPortalUrl("/goals")
  });
}

function sendGoalReturnedTeams(employeeName, managerName, remarks, cycleYear) {
  return safeSendTeamsNotification({
    title: "Goal Sheet Returned",
    text: `${managerName || "Your manager"} returned ${employeeName}'s goal sheet for updates.`,
    facts: [
      { title: "Employee", value: employeeName },
      { title: "Manager", value: managerName || "-" },
      { title: "Cycle", value: cycleYear },
      { title: "Remarks", value: remarks || "-" }
    ],
    ctaLabel: "Update Goals",
    ctaUrl: getPortalUrl("/goals")
  });
}

function sendCheckInDueTeams(managerName, pendingCount, quarter) {
  return safeSendTeamsNotification({
    title: `Check-in Reminder: ${quarter} Window is Open`,
    text: `${managerName}, you have ${pendingCount} team member(s) waiting for a ${quarter} check-in.`,
    facts: [
      { title: "Quarter", value: quarter },
      { title: "Pending", value: String(pendingCount) }
    ],
    ctaLabel: "Go to Check-ins",
    ctaUrl: getPortalUrl("/checkins")
  });
}

function sendEscalationTeams({ subject, message, affectedUserName, targetName, triggerEvent, thresholdDays }) {
  return safeSendTeamsNotification({
    title: subject || "AtomQuest Escalation",
    text: message,
    facts: [
      { title: "Affected User", value: affectedUserName || "-" },
      { title: "Escalated To", value: targetName || "-" },
      { title: "Trigger", value: triggerEvent || "-" },
      { title: "Threshold", value: thresholdDays ? `${thresholdDays} day(s)` : "-" }
    ],
    ctaLabel: "Open Admin Portal",
    ctaUrl: getPortalUrl("", "admin")
  });
}

export {
  buildAdaptiveCard,
  sendTeamsNotification,
  safeSendTeamsNotification,
  sendGoalSubmittedTeams,
  sendGoalApprovedTeams,
  sendGoalReturnedTeams,
  sendCheckInDueTeams,
  sendEscalationTeams
};