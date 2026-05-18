const nodemailer = require("nodemailer");

function getTransporter() {
  if (!process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function getBaseTemplate(title, bodyHtml) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
            <tr>
              <td style="background:#1e293b;padding:24px 32px;">
                <span style="color:#fff;font-size:20px;font-weight:700;">AtomQuest</span>
                <span style="color:#94a3b8;font-size:13px;margin-left:10px;vertical-align:middle;">Goal Portal</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="color:#1e293b;font-family:Georgia,serif;font-size:18px;font-weight:700;margin:0 0 16px;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">
                  This is an automated message from the AtomQuest Goal Portal. Please do not reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

function ctaButton(label, url, color = "#4F46E5") {
  if (!url) return "";
  return `
  <div style="margin:24px 0;">
    <a href="${url}" style="background:${color};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
      ${label} &rarr;
    </a>
  </div>
  `;
}

async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("\nEMAIL (dev mode - set SMTP_USER to send real emails)");
    console.log("   To:", to);
    console.log("   Subject:", subject);
    console.log("   HTML:", html.replace(/\s+/g, " ").slice(0, 500), "\n");
    return;
  }
  try {
    await transporter.sendMail({
      from: `"AtomQuest Goal Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`Email failed to ${to}:`, err.message);
  }
}

async function sendGoalSubmittedEmail({ managerEmail, managerName, employeeName, cycleYear }) {
  const html = getBaseTemplate(
    "Goal Sheet Submitted for Your Review",
    `
    <p style="color:#475569;line-height:1.6;">Hi ${managerName},</p>
    <p style="color:#475569;line-height:1.6;">
      <strong>${employeeName}</strong> has submitted their goal sheet for <strong>${cycleYear}</strong> and is awaiting your approval.
    </p>
    <p style="color:#475569;line-height:1.6;">
      Please review the submitted goals, make any necessary adjustments, and approve or return them within <strong>3 working days</strong>.
    </p>
    ${ctaButton("Review Goal Sheet", `${process.env.EMPLOYEE_PORTAL_URL || ""}/team`)}
    <p style="color:#94a3b8;font-size:13px;">If you have questions, please contact your HR administrator.</p>
    `
  );
  await sendEmail({
    to: managerEmail,
    subject: "[AtomQuest] Goal sheet submitted for your review",
    html
  });
}

async function sendGoalApprovedEmail({ employeeEmail, employeeName, managerName, cycleYear }) {
  const html = getBaseTemplate(
    "Your Goal Sheet Has Been Approved",
    `
    <p style="color:#475569;line-height:1.6;">Hi ${employeeName},</p>
    <p style="color:#475569;line-height:1.6;">
      Your goal sheet for <strong>${cycleYear}</strong> has been approved by <strong>${managerName}</strong>.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#166534;font-size:14px;margin:0;font-weight:600;">
        Your goals are now locked and the performance cycle has officially begun.
      </p>
    </div>
    <p style="color:#475569;line-height:1.6;">
      You can start logging your quarterly achievements when the next check-in window opens.
    </p>
    ${ctaButton("View My Goals", `${process.env.EMPLOYEE_PORTAL_URL || ""}/goals`)}
    `
  );
  await sendEmail({
    to: employeeEmail,
    subject: "[AtomQuest] Your goal sheet has been approved ✅",
    html
  });
}

async function sendGoalReturnedEmail({ employeeEmail, employeeName, managerName, remarks, cycleYear }) {
  const html = getBaseTemplate(
    "Action Required: Goal Sheet Returned for Revision",
    `
    <p style="color:#475569;line-height:1.6;">Hi ${employeeName},</p>
    <p style="color:#475569;line-height:1.6;">
      Your goal sheet for <strong>${cycleYear}</strong> has been returned by <strong>${managerName}</strong> and requires revision.
    </p>
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">
      <p style="color:#92400e;font-size:13px;font-weight:600;margin:0 0 6px;">Manager's Remarks:</p>
      <p style="color:#78350f;font-size:14px;margin:0;line-height:1.5;">${remarks || "Please review and resubmit your goals."}</p>
    </div>
    <p style="color:#475569;line-height:1.6;">Please address the feedback and resubmit your goal sheet as soon as possible.</p>
    ${ctaButton("Revise My Goals", `${process.env.EMPLOYEE_PORTAL_URL || ""}/goals`, "#D97706")}
    `
  );
  await sendEmail({
    to: employeeEmail,
    subject: "[AtomQuest] Action required: Goal sheet returned for revision",
    html
  });
}

async function sendCheckInReminderEmail({ userEmail, userName, quarter, windowCloseDate, isManager = false }) {
  const formattedDate = new Date(windowCloseDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const body = isManager
    ? `
      <p style="color:#475569;line-height:1.6;">Hi ${userName},</p>
      <p style="color:#475569;line-height:1.6;">
        The <strong>${quarter} check-in window</strong> is currently open. Some team members may still need their check-in completed.
      </p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#1e40af;font-size:14px;margin:0;font-weight:600;">Window closes on: ${formattedDate}</p>
      </div>
      ${ctaButton("Complete Team Check-ins", `${process.env.EMPLOYEE_PORTAL_URL || ""}/checkins`)}
    `
    : `
      <p style="color:#475569;line-height:1.6;">Hi ${userName},</p>
      <p style="color:#475569;line-height:1.6;">
        The <strong>${quarter} achievement update window</strong> is currently open. Please log your actual achievements before the window closes.
      </p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#1e40af;font-size:14px;margin:0;font-weight:600;">Window closes on: ${formattedDate}</p>
      </div>
      ${ctaButton("Update My Achievements", `${process.env.EMPLOYEE_PORTAL_URL || ""}/checkin`)}
    `;

  const html = getBaseTemplate(`Reminder: ${quarter} Check-in Window is Open`, body);
  await sendEmail({
    to: userEmail,
    subject: `[AtomQuest] Reminder: ${quarter} check-in window is closing soon`,
    html
  });
}

async function sendEscalationEmail(args, legacySubject, legacyBody) {
  const payload = typeof args === "object"
    ? args
    : { toEmail: args, subject: legacySubject, body: legacyBody };
  const content = `
    <p style="color:#475569;line-height:1.6;">Hi ${payload.toName || "there"},</p>
    <p style="color:#475569;line-height:1.6;">${payload.body || ""}</p>
    ${ctaButton(payload.ctaLabel || "Open AtomQuest", payload.ctaUrl || process.env.ADMIN_PORTAL_URL || "")}
  `;
  await sendEmail({
    to: payload.toEmail,
    subject: payload.subject,
    html: getBaseTemplate(payload.subject, content)
  });
}

module.exports = {
  getBaseTemplate,
  sendGoalSubmittedEmail,
  sendGoalApprovedEmail,
  sendGoalReturnedEmail,
  sendCheckInReminderEmail,
  sendEscalationEmail
};
