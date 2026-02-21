// models/Booking.js
const mongoose =require ("mongoose");

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
passenger: {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", // better than "User"
    required: true
  },
  name: String,
  phoneNumber: String
}
,
driver: {
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",   // 🔥 FIX
    required: true
  },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true }
},
  vehicle: {
    carModel: { type: String, required: true },
    carColor: { type: String },
    carNumber: { type: String, required: true },
  },
  route: {
    from: { type: String, required: true },
    fromAddress: { type: String },
    to: { type: String, required: true },
    toAddress: { type: String },
  },
  passengersCount: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerSeat: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports= mongoose.model("Booking", bookingSchema);

