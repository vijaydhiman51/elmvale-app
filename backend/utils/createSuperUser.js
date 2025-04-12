const User = require("../models/User");

async function createSuperUser() {
  if (process.env.ADD_SUPERUSER === "true") {
    try {
      const existing = await User.findOne({
        email: process.env.SUPERUSER_EMAIL,
      });

      if (existing && process.env.SUPERUSER_ENABLED && existing?.status !== "active") {
        if (existing?.status !== "active") {
          existing.status = "active";
        } else {
          existing.status = "inactive";
        }
        await existing.save();
      }

      if (existing) {
        console.log("✅ Superuser already exists");
        return;
      }

      const superuser = new User({
        username: process.env.SUPERUSER_USERNAME,
        email: process.env.SUPERUSER_EMAIL,
        password: process.env.SUPERUSER_PASSWORD,
        roles: ["admin"],
        passwordFresh: false,
        personalInfo: {
          fullName: {
            first: process.env.SUPERUSER_FIRST_NAME,
            middle: "",
            last: process.env.SUPERUSER_LAST_NAME,
          },
        },
        metadata: {
          lastPasswordChangeAt: new Date(),
        },
      });

      await superuser.save();
      console.log("🚀 Superuser created successfully");
    } catch (error) {
      console.error("Failed to create superuser:", error.message);
    }
  }
}

module.exports = createSuperUser;
