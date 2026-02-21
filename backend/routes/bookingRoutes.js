// routes/bookingRoutes.js
const express = require("express");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");
const Customer = require("../models/Customer");
const Driver = require("../models/Driver");

const router = express.Router();

/* ============================================================================
   🔵 POST — Create a New Booking
   ============================================================================ */
router.post("/", async (req, res) => {
  try {
    const { rideId, email, passengersCount } = req.body;

    // 🔥 Populate driver reference
    const ride = await Ride.findById(rideId).populate("driver");
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Passenger
    let user = await Customer.findOne({ email });
    if (!user) user = await Driver.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Driver (REAL mongoose document)
    const driver = ride.driver;
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const totalPrice = ride.price * passengersCount;

    const booking = new Booking({
      ride: ride._id,

      passenger: {
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        phoneNumber: user.phoneNumber
      },

      driver: {
        driverId: driver._id, // ✅ FIXED
        name: `${driver.firstName} ${driver.lastName}`,
        phoneNumber: driver.phoneNumber
      },

      vehicle: ride.vehicle,
      route: ride.route,
      passengersCount,
      pricePerSeat: ride.price,
      totalPrice,
      status: "pending"
    });

    await booking.save();
    res.status(201).json(booking);
    console.log("Ride driver field:", ride.driver);

  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      message: "Server error while creating booking",
      error: error.message
    });
  }
});


/* ============================================================================
   🔵 GET — Passenger Booking List (Upcoming + Completed)
   ============================================================================ */
router.get("/passenger/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { status } = req.query;

    // Try customer → driver
const safeEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let user = await Customer.findOne({
  email: new RegExp(`^${safeEmail}$`, "i")
});

const safeEmail2 = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
if (!user) {
  user = await Driver.findOne({
    email: new RegExp(`^${safeEmail2}$`, "i")
  });
}

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build status filter
    let query = { "passenger.userId": user._id };

    if (status === "upcoming") {
      query.status = { $in: ["pending", "confirmed"] };
    } else if (status === "completed") {
      query.status = { $in: ["completed", "cancelled"] };
    }

    const bookings = await Booking.find(query)
      .populate("ride")
      .sort({ bookedAt: -1 });

    res.json(bookings);

  } catch (error) {
    console.error("Error fetching passenger bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================================
   🔵 GET — Driver Bookings (Grouped by Ride)
   ============================================================================ */
router.get("/driver/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { status } = req.query;

    // Find driver profile
    const driver = await Driver.findOne({
      email: new RegExp(`^${email}$`, "i")
    });

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Build query
    let query = { "driver.driverId": driver._id };

    if (status === "upcoming") {
      query.status = { $in: ["pending", "confirmed"] };
    } else if (status === "completed") {
      query.status = { $in: ["completed", "cancelled"] };
    }

    // Fetch all bookings of this driver
    const bookings = await Booking.find(query)
      .populate("ride")
      .sort({ bookedAt: -1 });

    // Group by ride
// Group by ride
const grouped = {};

bookings.forEach((b) => {
  // ✅ CRITICAL FIX
  if (!b.ride) {
    console.warn("⚠️ Skipping booking with missing ride:", b._id);
    return;
  }

  const rideId = b.ride._id.toString();

  if (!grouped[rideId]) {
    grouped[rideId] = {
      ride: b.ride,
      driver: b.driver,
      vehicle: b.vehicle,
      route: b.route,
      passengers: []
    };
  }

  grouped[rideId].passengers.push({
    bookingId: b._id,
    userId: b.passenger.userId,
    name: b.passenger.name,
    phoneNumber: b.passenger.phoneNumber,
    passengersCount: b.passengersCount,
    status: b.status,
    bookedAt: b.bookedAt
  });
});

    res.json(Object.values(grouped));

  } catch (error) {
    console.error("Error fetching driver bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================================
   🔵 PATCH — Accept a Passenger
   ============================================================================ */
router.patch("/:bookingId/accept", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { passengerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.passenger.userId.toString() !== passengerId) {
      return res.status(400).json({ message: "Passenger mismatch" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Booking accepted", booking });

  } catch (error) {
    console.error("Error accepting booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================================
   🔵 PATCH — Decline a Passenger
   ============================================================================ */
router.patch("/:bookingId/decline", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { passengerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.passenger.userId.toString() !== passengerId) {
      return res.status(400).json({ message: "Passenger mismatch" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking declined", booking });

  } catch (error) {
    console.error("Error declining booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================================
   🔵 PATCH — Submit Rating
   ============================================================================ */
router.patch("/:bookingId/rate", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { overallRating, drivingSkillRating, feedback } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.rating = {
      overall: overallRating,
      drivingSkill: drivingSkillRating || overallRating
    };
    booking.feedback = feedback;

    await booking.save();

    res.json({ message: "Rating submitted", booking });

  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
