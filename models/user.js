 const mongoose=require("mongoose")
const Schema =mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");


const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  username: {
    type: String,
    required: true,
  },

  userType: {
    type: String,
    enum: ["traveler", "owner"],
    required: true,
  },

  googleUID: {
    type: String, 
    default: null,
  },

  PaidListings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    }
  ],
Bookings: [
  { type: Schema.Types.ObjectId, ref: "Booking" }
],
  
  createdAt: {
    type: Date,
    default: Date.now,
  }
});





userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);