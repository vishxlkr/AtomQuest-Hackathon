const Cycle = require("../models/Cycle");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const enforceQuarterWindow = asyncHandler(async (req, res, next) => {
  const cycle = await Cycle.findOne({ isActive: true });
  if (!cycle) throw new ApiError(404, "NO_ACTIVE_CYCLE", "No active cycle found");
  const now = new Date();
  const activeQuarter = cycle.quarters.find((q) => now >= q.windowOpen && now <= q.windowClose);
  const requestedQuarter = req.body?.quarter || req.body?.items?.[0]?.quarter;
  if (!activeQuarter && !requestedQuarter) throw new ApiError(403, "QUARTER_WINDOW_CLOSED", "Quarterly achievement window is closed");
  req.currentCycle = cycle;
  req.currentQuarter = activeQuarter?.quarter || requestedQuarter;
  next();
});

module.exports = { enforceQuarterWindow };
