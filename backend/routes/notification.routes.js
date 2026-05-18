import express from "express";
import { verifyToken } from "../middleware/auth.js";
import * as ctrl from "../controllers/notification.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", ctrl.listNotifications);
router.patch("/read-all", ctrl.markAllRead);
router.patch("/:id/read", ctrl.markRead);

export default router;
