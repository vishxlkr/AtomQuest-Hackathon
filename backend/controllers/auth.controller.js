const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { getMsalClient } = require("../config/azureAD");
const { generateUserId } = require("../utils/userIdGenerator");

function signAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, "EMAIL_EXISTS", "Email already exists");
  const employeeId = await generateUserId("employee");
  const user = await User.create({ employeeId, name, email, password, authProvider: "local", role: "employee", department, managerId: null });
  res.status(201).json({ success: true, data: user.toSafeObject() });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password +refreshToken");
  if (!user || !user.isActive) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  if (user.authProvider === "azure") throw new ApiError(401, "MICROSOFT_LOGIN_REQUIRED", "Please sign in with Microsoft");
  if (!(await user.comparePassword(req.body.password))) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();
  setRefreshCookie(res, refreshToken);
  const safeUser = user.toSafeObject();
  res.json({ success: true, accessToken, user: safeUser, data: { accessToken, user: safeUser } });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "NO_REFRESH_TOKEN", "Refresh token is required");
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || !user.refreshToken || !(await bcrypt.compare(token, user.refreshToken))) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }
  const accessToken = signAccessToken(user);
  res.json({ success: true, accessToken, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: "" } });
    } catch (_) {}
  }
  res.clearCookie("refreshToken");
  res.json({ success: true });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
});

const getAzureLoginUrl = asyncHandler(async (req, res) => {
  if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_REDIRECT_URI) {
    return res.status(503).json({ success: false, error: { code: "AZURE_NOT_CONFIGURED", message: "SSO available in production environment" } });
  }
  const portal = ["admin", "employee"].includes(req.query.portal) ? req.query.portal : "employee";
  const authUrl = await getMsalClient().getAuthCodeUrl({
    scopes: ["openid", "profile", "email", "User.Read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
    state: portal
  });
  res.json({ success: true, data: { authUrl }, authUrl });
});

const handleAzureCallback = asyncHandler(async (req, res) => {
  if (!req.query.code) throw new ApiError(400, "CODE_REQUIRED", "Azure authorization code is required");
  const tokenResponse = await getMsalClient().acquireTokenByCode({
    code: req.query.code,
    scopes: ["openid", "profile", "email", "User.Read"],
    redirectUri: process.env.AZURE_REDIRECT_URI
  });
  const account = tokenResponse.account;
  const email = account.username;
  const name = account.name || email.split("@")[0];
  const azureOid = account.localAccountId || account.homeAccountId;

  let user = await User.findOne({ $or: [{ email }, { azureOid }] }).select("+password");
  if (user) {
    user.name = name;
    user.azureOid = user.azureOid || azureOid;
    if (!user.password) user.authProvider = "azure";
    await user.save();
  } else {
    const employeeId = await generateUserId("employee");
    user = await User.create({
      name,
      email,
      employeeId,
      authProvider: "azure",
      role: "employee",
      azureOid
    });
  }

  const accessToken = signAccessToken(user);
  const refreshTokenValue = signRefreshToken(user);
  user.refreshToken = await bcrypt.hash(refreshTokenValue, 10);
  await user.save();
  setRefreshCookie(res, refreshTokenValue);
  const requestedPortal = ["admin", "employee"].includes(req.query.state) ? req.query.state : null;
  const portalBase = requestedPortal === "admin" && ["admin", "manager"].includes(user.role)
    ? process.env.ADMIN_PORTAL_URL
    : requestedPortal === "employee" && user.role === "employee"
      ? process.env.EMPLOYEE_PORTAL_URL
      : user.role === "employee"
        ? process.env.EMPLOYEE_PORTAL_URL
        : process.env.ADMIN_PORTAL_URL;
  res.redirect(`${portalBase}/auth/callback?token=${encodeURIComponent(accessToken)}`);
});

module.exports = { register, login, refreshToken, logout, getMe, getAzureLoginUrl, handleAzureCallback };
