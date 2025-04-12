const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
      validate: {
        validator: function (arr) {
          return (
            arr.length > 0 &&
            arr.every((role) => ["user", "admin"].includes(role))
          );
        },
        message: (props) => `Invalid role(s): ${props.value}`,
      },
    },

    passwordFresh: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
      validate: {
        validator: function (value) {
          return ["active", "inactive", "blocked"].includes(value);
        },
        message: (props) => `${props.value} is not a valid status.`,
      },
    },

    personalInfo: {
      fullName: {
        first: { type: String },
        middle: { type: String },
        last: { type: String },
      },
      dob: { type: Date },
      gender: { type: String, enum: ["male", "female", "other"] },
      phoneNumbers: [String],
      profilePhotoUrl: String,
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
      },
    },

    metadata: {
      loginAttempts: { type: Number, default: 0 },
      lastLoginAt: { type: Date },
      lastPasswordChangeAt: { type: Date },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.metadata.lastPasswordChangeAt = new Date();
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.hasRole = function (role) {
  return this.roles.includes(role);
};

module.exports = mongoose.model("User", UserSchema);
