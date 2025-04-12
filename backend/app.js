const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const commonRoutes = require("./routes/commonRoutes");
const createSuperUser = require("./utils/createSuperUser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, false);
      return callback(null, origin);
    },
    credentials: true,
  })
);

connectDB().then((db) => {
  createSuperUser();
  app.use("/api/auth", authRoutes);
  app.use("/api/membership", membershipRoutes);
  app.use("/api", commonRoutes);
  app.use('/images', express.static(path.join(__dirname, 'uploads/images')));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
