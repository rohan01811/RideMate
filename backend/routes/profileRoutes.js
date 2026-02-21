// backend/routes/profileRoutes.js
const express = require("express");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const router = express.Router();

// ========== DRIVER ROUTES ==========

// Create driver profile
router.post("/driver", async (req, res) => {
  try {
    const existingDriver = await Driver.findOne({
      email: { $regex: new RegExp(`^${req.body.email}$`, "i") }
    });

    if (existingDriver) {
      return res.status(400).json({
        error: "Email already exists",
        existingProfile: {
          ...existingDriver.toObject(),
          password: ""
        }
      });
    }

    const driver = new Driver({
      ...req.body,
      password: req.body.password
    });

    await driver.save();

    res.status(201).json({
      ...driver.toObject(),
      password: ""
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get driver by email
router.get("/driver/email/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();

    const driver = await Driver.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });

    if (!driver)
      return res.status(404).json({ message: "Driver not found" });

    res.json({
      ...driver.toObject(),
      password: ""
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update driver
router.put("/driver/:id", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!driver)
      return res.status(404).json({ message: "Driver not found" });

    res.json({
      ...driver.toObject(),
      password: ""
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== CUSTOMER ROUTES ==========

// Create customer
router.post("/customer", async (req, res) => {
  try {
    const existingCustomer = await Customer.findOne({
      email: { $regex: new RegExp(`^${req.body.email}$`, "i") }
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: "Email already exists",
        existingProfile: {
          ...existingCustomer.toObject(),
          password: ""
        }
      });
    }

    const customer = new Customer({
      ...req.body,
      password: req.body.password
    });

    await customer.save();

    res.status(201).json({
      ...customer.toObject(),
      password: ""
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get customer by email
router.get("/customer/email/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();

    const customer = await Customer.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    res.json({
      ...customer.toObject(),
      password: ""
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put("/customer/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    res.json({
      ...customer.toObject(),
      password: ""
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
