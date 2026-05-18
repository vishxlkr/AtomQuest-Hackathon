require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { ensureEnvAdmin } = require("./config/bootstrapAdmin");
const errorHandler = require("./middleware/errorHandler");
const { startCronJobs } = require("./utils/cronJobs");

const app = express();
const allowedOrigins = [process.env.EMPLOYEE_PORTAL_URL, process.env.ADMIN_PORTAL_URL].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"))), credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/v1", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true }));

app.get("/health", (req, res) => res.json({ success: true, service: "atomquest-api" }));
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/users", require("./routes/user.routes"));
app.use("/api/v1/goals", require("./routes/goal.routes"));
app.use("/api/v1/checkin", require("./routes/checkin.routes"));
app.use("/api/v1/admin", require("./routes/admin.routes"));
app.use("/api/v1/reports", require("./routes/report.routes"));
app.use("/api/v1/cycles", require("./routes/cycle.routes"));
app.use("/api/v1/notifications", require("./routes/notification.routes"));
app.use("/api/v1", require("./routes/escalation.routes"));
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() => {
  ensureEnvAdmin()
    .then(() => {
      startCronJobs();
      app.listen(port, () => console.log(`AtomQuest API running on ${port}`));
    })
    .catch((err) => {
      console.error("Failed to bootstrap admin user", err);
      process.exit(1);
    });
}).catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

module.exports = app;
