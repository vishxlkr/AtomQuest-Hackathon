const Counter = require("../models/Counter");
const User = require("../models/User");

const PREFIX_BY_ROLE = {
  admin: "ADM",
  manager: "MGR",
  employee: "EMP"
};

async function syncCounter(prefix) {
  const users = await User.find({ employeeId: new RegExp(`^${prefix}\\d+$`) }).select("employeeId").lean();
  const maxExisting = users.reduce((max, user) => {
    const number = Number(user.employeeId.slice(prefix.length));
    return Number.isFinite(number) && number > max ? number : max;
  }, 0);

  await Counter.updateOne({ _id: `user:${prefix}` }, { $max: { seq: maxExisting } }, { upsert: true });
}

async function generateUserId(role = "employee") {
  const prefix = PREFIX_BY_ROLE[role] || PREFIX_BY_ROLE.employee;
  await syncCounter(prefix);
  const counter = await Counter.findOneAndUpdate(
    { _id: `user:${prefix}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(counter.seq).padStart(3, "0")}`;
}

module.exports = { generateUserId };
