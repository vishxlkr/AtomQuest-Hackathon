const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL;

async function sendTeamsNotification({ title, text, facts = [], ctaLabel, ctaUrl }) {
  if (!TEAMS_WEBHOOK_URL) {
    console.log("Teams notification skipped:", title);
    return;
  }

  const payload = {
    type: "message",
    attachments: [{
      contentType: "application/vnd.microsoft.card.adaptive",
      content: {
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        type: "AdaptiveCard",
        version: "1.4",
        body: [
          { type: "TextBlock", text: "AtomQuest Goal Portal", weight: "Bolder", size: "Small", color: "Accent" },
          { type: "TextBlock", text: title, weight: "Bolder", size: "Medium", wrap: true },
          { type: "TextBlock", text, wrap: true, color: "Default" },
          { type: "FactSet", facts }
        ],
        actions: ctaUrl ? [{ type: "Action.OpenUrl", title: ctaLabel || "Open AtomQuest", url: ctaUrl }] : []
      }
    }]
  };

  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) console.error("Teams notification failed:", response.status, await response.text());
  } catch (err) {
    console.error("Teams notification error:", err.message);
  }
}

function sendGoalSubmittedTeams(employeeName, managerName, cycleYear) {
  return sendTeamsNotification({
    title: "Goal Sheet Submitted for Review",
    text: `${employeeName} has submitted their goal sheet and is awaiting your approval.`,
    facts: [{ title: "Employee", value: employeeName }, { title: "Manager", value: managerName || "-" }, { title: "Cycle", value: cycleYear }],
    ctaLabel: "Review in AtomQuest",
    ctaUrl: `${process.env.ADMIN_PORTAL_URL || ""}/team`
  });
}

function sendGoalApprovedTeams(employeeName, cycleYear) {
  return sendTeamsNotification({
    title: "Goal Sheet Approved",
    text: `Your goal sheet for ${cycleYear} has been approved. Your goals are now locked.`,
    facts: [{ title: "Employee", value: employeeName }, { title: "Cycle", value: cycleYear }],
    ctaLabel: "View My Goals",
    ctaUrl: `${process.env.EMPLOYEE_PORTAL_URL || ""}/goals`
  });
}

function sendCheckInDueTeams(managerName, pendingCount, quarter) {
  return sendTeamsNotification({
    title: `Check-in Reminder: ${quarter} Window is Open`,
    text: `${managerName}, you have ${pendingCount} team member(s) waiting for a ${quarter} check-in.`,
    facts: [{ title: "Quarter", value: quarter }, { title: "Pending", value: String(pendingCount) }],
    ctaLabel: "Go to Check-ins",
    ctaUrl: `${process.env.ADMIN_PORTAL_URL || ""}/checkins`
  });
}

module.exports = { sendTeamsNotification, sendGoalSubmittedTeams, sendGoalApprovedTeams, sendCheckInDueTeams };
