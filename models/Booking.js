const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  roomsBooked: { type: Number, required: true },
  price: { type: Number, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  tokenPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
