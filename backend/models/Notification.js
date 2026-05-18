const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  type: { type: String, index: true },
  title: String,
  message: String,
  isRead: { type: Boolean, default: false, index: true },
  link: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model("Notification", notificationSchema);
