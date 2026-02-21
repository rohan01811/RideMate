// models/driver.js
const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profilePhoto: { type: String }, // will store image URL
    password: { type: String, required: true },

    // Car details
    carModel: { type: String, required: true },
    carNumber: { type: String, required: true, unique: true },
    carColor: { type: String },
    drivingLicence: { type: String }, // store file path / cloud URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
