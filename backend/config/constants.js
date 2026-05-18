const ROLES = ["employee", "manager", "admin", "hr"];
const UOM_TYPES = ["min", "max", "timeline", "zero"];
const GOAL_STATUSES = ["draft", "active", "locked"];
const APPROVAL_STATUSES = ["draft", "submitted", "approved", "returned"];
const PROGRESS_STATUSES = ["not_started", "on_track", "completed"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const DEFAULT_QUARTER_WINDOWS = [
  { quarter: "Q1", month: "July" },
  { quarter: "Q2", month: "October" },
  { quarter: "Q3", month: "January" },
  { quarter: "Q4", month: "March/April" }
];

export { ROLES, UOM_TYPES, GOAL_STATUSES, APPROVAL_STATUSES, PROGRESS_STATUSES, QUARTERS, DEFAULT_QUARTER_WINDOWS };