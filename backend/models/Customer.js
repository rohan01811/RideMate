// models/Customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profilePhoto: { type: String },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
