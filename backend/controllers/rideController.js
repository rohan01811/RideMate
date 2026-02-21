const Ride = require("../models/Ride");

// Create Ride
const createRide = async (req, res) => {
  try {
    const { departure, destination, date, seatsAvailable, price, driver } = req.body;

    const ride = new Ride({
      departure,
      destination,
      date,
      seatsAvailable,
      price,
      driver,
    });

    await ride.save();
    res.status(201).json({ message: "Ride created successfully", ride });
  } catch (error) {
    res.status(500).json({ message: "Error creating ride", error: error.message });
  }
};

// Search Rides
const searchRides = async (req, res) => {
  try {
    const { departure, destination, date } = req.query;

    let query = {};
    if (departure) query.departure = { $regex: departure, $options: "i" };
    if (destination) query.destination = { $regex: destination, $options: "i" };
    if (date) query.date = { $eq: new Date(date) };

    const rides = await Ride.find(query);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: "Error searching rides", error: error.message });
  }
};

module.exports = { createRide, searchRides };
