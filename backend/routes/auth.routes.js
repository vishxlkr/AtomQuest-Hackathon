const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, refreshToken, logout, getMe, getAzureLoginUrl, handleAzureCallback } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true });
const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true });
const authRules = [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 8 })];

router.post("/register", [...authRules, body("name").notEmpty()], validateRequest, register);
router.post("/login", loginLimiter, authRules, validateRequest, login);
router.post("/refresh", refreshLimiter, refreshToken);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);
router.get("/azure/login", getAzureLoginUrl);
router.get("/azure/callback", handleAzureCallback);

module.exports = router;
