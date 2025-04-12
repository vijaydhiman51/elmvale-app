const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
      match: [/^[A-Za-z0-9\s\-]+$/, "Please enter a valid postal code."],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid phone number."],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    membershipType: {
      type: String,
      enum: ["New", "Renewing"],
      required: true,
    },
    agreedToCode: {
      type: Boolean,
      required: true,
      validate: {
        validator: val => val === true,
        message: "You must agree to the code of conduct.",
      },
    },
    signature: {
      type: String,
      required: true,
      trim: true,
    },
    printedName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Membership", membershipSchema);
