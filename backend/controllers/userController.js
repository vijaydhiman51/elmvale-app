const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const { username, email, roles = ["user"], personalInfo } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const generatedPassword = generatePassword();

  const newUser = new User({
    username,
    email,
    password: generatedPassword,
    roles,
    personalInfo,
  });

  await newUser.save();
  const fileContent = `Your account has been created.\n\nUsername: ${username}\nEmail: ${email}\nPassword: ${generatedPassword}\n`;

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${username}_credentials.txt`
  );
  res.setHeader("Content-Type", "text/plain");

  res.status(201).send(fileContent);
};

exports.profile = async (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => {
      res.json(user);
    });
};

exports.profileById = async (req, res) => {
  const { userId } = req.query;
  User.findById(userId)
    .select("-password")
    .then((user) => {
      res.json(user);
    });
};

exports.users = async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        id: 1,
        email: 1,
        roles: 1,
        status: 1,
        createdAt: 1,
        "personalInfo.fullName.first": 1,
        "personalInfo.fullName.last": 1,
        "personalInfo.gender": 1,
        "personalInfo.phoneNumbers": 1,
        "personalInfo.address.city": 1,
      }
    );

    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.personalInfo.fullName.first || ""} ${
        user.personalInfo.fullName.last || ""
      }`.trim(),
      email: user.email,
      phone: user.personalInfo.phoneNumbers?.[0] || "",
      gender: user.personalInfo.gender || "",
      city: user.personalInfo.address?.city || "",
      status: user.status,
      roles: user.roles.join(", "),
      registeredOn: new Date(user.createdAt).toLocaleDateString(),
    }));

    res.json(transformedUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
