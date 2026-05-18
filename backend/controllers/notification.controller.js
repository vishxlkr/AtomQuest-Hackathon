import Notification from "../models/Notification.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const listNotifications = asyncHandler(async (req, res) => {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }),
    Notification.countDocuments({ userId: req.user._id, isRead: false })
  ]);
  res.json({ success: true, data: { items, unreadCount } });
});

const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true });
  if (!item) throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "Notification not found");
  res.json({ success: true, data: item });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id }, { isRead: true });
  res.json({ success: true });
});

export { listNotifications, markRead, markAllRead };