// rides/backend/models/Ride.js
const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true
    },

    vehicle: {
      carModel: String,
      carNumber: String,
      carColor: String
    },

    route: {
      from: { type: String, required: true },
      to: { type: String, required: true }
    },

    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date },
    seatsLeft: { type: Number, required: true },
    price: { type: Number, required: true },
    durationTime: Number,

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
