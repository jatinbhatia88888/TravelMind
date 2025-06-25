const mongoose =require("mongoose");
const Schema=mongoose.Schema;
const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  images: [
    {
      url: String,
      filename: String
    }
  ],
  price: Number,
  category: {
    type: String,
    enum: ['budget', 'luxury', 'resort', 'hostel', 'homestay', 'boutique'],
    required: true
  },
  roomCount: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [String],
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  location: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  propertyType: [{ type: String }],
  cancellationPolicy: {
    type: String,
    enum: ['free_24h', 'partial', 'none'],
    default: 'free_24h'
  },
  tokenPaid: { type: Boolean, default: false },
  tokenPaymentId: { type: String, default: null },
  client: { type: Schema.Types.ObjectId, ref: 'User', default: null }
});

module.exports =mongoose.model("Listing",listingSchema);