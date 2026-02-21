// backend/routes/authRoutes.js
const express = require("express");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    let { email, password, userType } = req.body;
    email = email.trim().toLowerCase();

    let userModel = userType === "driver" ? Driver : Customer;

    // 1️⃣ Find user account (login table)
    let user = await userModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });

    if (!user) {
      return res.status(400).json({
        msg: `No ${userType} account found for this email`
      });
    }

    // 2️⃣ Password check
    if (password !== user.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3️⃣ AUTO-CREATE DRIVER PROFILE if needed
    if (userType === "driver") {
      let driverProfile = await Driver.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") }
      });

      if (!driverProfile) {
        console.log("🚗 Creating new blank driver profile...");

        driverProfile = new Driver({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          password: user.password, // keep plain password
          carModel: "",
          carNumber: "",
          carColor: "",
          gender: "",
          phoneCode: "+91",
          profilePhoto: "",
          drivingLicense: ""
        });

        await driverProfile.save();
      }

      // Return profile safely
      const sanitizedDriver = {
        ...driverProfile.toObject(),
        password: ""
      };

      return res.json({
        success: true,
        user: sanitizedDriver
      });
    }

    // 4️⃣ PASSENGER → return full profile too
    const sanitizedCustomer = {
      ...user.toObject(),
      password: ""
    };

    return res.json({
      success: true,
      user: sanitizedCustomer
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
