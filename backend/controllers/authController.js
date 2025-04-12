const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.status !== "active") {
    return res
      .status(403)
      .json({ message: "User is not active. Contact admin." });
  }

  user.metadata.lastLoginAt = new Date();
  user.metadata.loginCount = (user.metadata.loginCount || 0) + 1;
  await user.save();

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      roles: user.roles,
      passwordFresh: user.passwordFresh,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.personalInfo.fullName,
      username: user.username,
      email: user.email,
      role: user.roles,
      status: user.status,
      isPasswordFresh: user.passwordFresh,
    },
  });
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!checkPasswordCriteria(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include at least one letter and one special character (!@#$%^&*).",
    });
  }

  user.password = newPassword;
  user.passwordFresh = false;
  user.metadata.passwordChangedAt = new Date();
  await user.save();

  res.json({ message: "Password changed successfully" });
};

exports.forgotPassword = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findOne({ username, email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with given email and username." });
    }

    const token = generateToken({ userId: user._id }, "10m");

    res.status(200).json({
      message: "Verification successful. Use this token to reset password.",
      resetToken: token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!checkPasswordCriteria(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one letter and one special character (!@#$%^&*).",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    user.passwordFresh = false;
    user.metadata.passwordChangedAt = new Date();
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: err.message });
  }
};

const checkPasswordCriteria = (password) => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).{8,}$/;
  return passwordRegex.test(password);
};
