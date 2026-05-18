import Notification from "../models/Notification.js";

function createNotification(userId, type, title, message, link) {
  if (!userId) return null;
  return Notification.create({ userId, type, title, message, link });
}

export { createNotification };