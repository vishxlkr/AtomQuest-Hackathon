const User = require("../models/User");

async function ensureEnvAdmin() {
   const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
   const password = process.env.ADMIN_PASSWORD;
   if (!email || !password) return;

   const employeeId = process.env.ADMIN_EMPLOYEE_ID || "ADM001";
   const name = process.env.ADMIN_NAME || "Admin User";
   const department = process.env.ADMIN_DEPARTMENT || "HR";

   const existing = await User.findOne({
      $or: [{ email }, { employeeId }],
   }).select("+password");

   if (!existing) {
      await User.create({
         employeeId,
         name,
         email,
         password,
         authProvider: "local",
         role: "admin",
         department,
         isActive: true,
      });
      console.log(`Admin user created from env: ${email}`);
      return;
   }

   existing.name = name;
   existing.employeeId = employeeId;
   existing.email = email;
   existing.department = department;
   existing.role = "admin";
   existing.authProvider = "local";
   existing.isActive = true;
   existing.password = password;
   existing.markModified("password");
   await existing.save();
   console.log(`Admin user updated from env: ${email}`);
}

module.exports = { ensureEnvAdmin };
