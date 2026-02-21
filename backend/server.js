const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rideRoutes = require("./routes/rideRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes =require("./routes/bookingRoutes.js");
require("dotenv").config();

const app = express();
app.use(cors());

app.use(express.json({ limit: "10mb" })); // instead of default 100kb
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/rides", rideRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
