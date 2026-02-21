// routes/rideRoutes.js
const express = require("express");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

const router = express.Router();

// Ride search (fuzzy + future rides)
router.get("/search", async (req, res) => {
  try {
    const { departure, destination } = req.query;
    const today = new Date();

    const depWords = departure.split(" ").filter(Boolean);
    const destWords = destination.split(" ").filter(Boolean);

    const depRegex = depWords.map(word => ({ "route.from": { $regex: word, $options: "i" }}));
    const destRegex = destWords.map(word => ({ "route.to": { $regex: word, $options: "i" }}));

    const rides = await Ride.find({
      departureTime: { $gte: today },
      $and: [{ $or: depRegex }, { $or: destRegex }]
    }).sort({ departureTime: 1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish ride
router.post("/publish", async (req, res) => {
  try {
    const {
      driverEmail,
      route,
      departureTime,
      arrivalTime,
      duration,
      seatsLeft,
      price
    } = req.body;

    const driver = await Driver.findOne({ email: driverEmail });
    if (!driver) {
      return res.status(404).json({ error: "Driver profile not found" });
    }

    const ride = new Ride({
      driver: driver._id, // ✅ reference only
      vehicle: {
        carModel: driver.carModel,
        carNumber: driver.carNumber,
        carColor: driver.carColor
      },
      route,
      departureTime,
      arrivalTime,
      durationTime: duration,
      seatsLeft,
      price
    });

    await ride.save();
    res.status(201).json({ message: "Ride published successfully", ride });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all rides
// 🔵 Get ride by ID (WITH DRIVER POPULATED)
router.get("/:id", async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
