const Notification = require("../models/Notification");

function createNotification(userId, type, title, message, link) {
  if (!userId) return null;
  return Notification.create({ userId, type, title, message, link });
}

module.exports = { createNotification };
