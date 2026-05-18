const express = require("express");
const { verifyToken } = require("../middleware/auth");
const ctrl = require("../controllers/notification.controller");

const router = express.Router();
router.use(verifyToken);
router.get("/", ctrl.listNotifications);
router.patch("/read-all", ctrl.markAllRead);
router.patch("/:id/read", ctrl.markRead);

module.exports = router;
