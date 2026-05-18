const express = require("express");
const { verifyToken, requireRole } = require("../middleware/auth");
const { listEmployees } = require("../controllers/user.controller");

const router = express.Router();
router.get("/employees", verifyToken, requireRole("manager", "admin"), listEmployees);

module.exports = router;
