const Listing =require("../models/listing.js");
const Favorite=require("../models/favourite.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User= require("../models/user.js");
const admin = require("../utils/admin.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); 


const geminiApiKey = process.env.GEMINI_API_KEY; 


const genAI = new GoogleGenerativeAI(geminiApiKey);




module.exports.generateItinerary = async (req, res) => {
  const {
    destination,
    startDate,
    endDate,
    minBudget,
    maxBudget,
    travelers,
    interests = [],
    note,
  } = req.body;

  
  const selectedInterests = Array.isArray(interests) ? interests : [interests];

  try {
   
    const listings = await Listing.find({
      "location.city": { $regex: new RegExp(destination, "i") },
      price: { $gte: minBudget, $lte: maxBudget },
    }).limit(6);
    // console.dir(listings);
    // console.log(destination);
   
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

   
    const dayCount = Math.ceil(
  (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
) + 1;

const prompt = `
Plan a ${travelers}-person trip to ${destination} for ${dayCount} days (from ${startDate} to ${endDate}).
Budget: ₹${minBudget}–₹${maxBudget}
Preferences: ${selectedInterests.join(", ") || "None"}
Additional Notes: ${note || "None"}

Create a detailed travel itinerary in JSON format. Each day should include the city and a list of activities.
Example JSON format:
[
  {
    "day": 1,
    "city": "${destination}",
    "activities": ["Visit landmark A", "Explore cultural site B", "Dinner at restaurant C"]
  },
  {
    "day": 2,
    "city": "${destination}",
    "activities": ["Morning hike", "Art gallery visit", "Enjoy local cuisine"]
  }
]
Return only valid JSON. The number of days in the itinerary should exactly match the number of days between the start and end date (inclusive).
`;


   
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawContent = response.text(); 
    let itinerary;
    try {
      
      const jsonString = rawContent.replace(/```json\n|\n```/g, "").trim();
      itinerary = JSON.parse(jsonString);
    } catch (e) {
      console.error("Invalid JSON from Gemini API:", e);
      console.error("Raw content received from Gemini:", rawContent); 
      itinerary = [
        {
          day: 1,
          city: destination,
          activities: ["Arrive and settle in", "Explore nearby markets or attractions"],
        },
      ];
    }

    
    req.session.itineraryData = {
      itinerary,
      listings,
      destination,
      interests:selectedInterests,
    };

    
    res.redirect("/listings/plantrip/result");
  } catch (err) {
    console.error("Error generating itinerary:", err); 
    res.status(500).send("Something went wrong while generating the itinerary.");
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

  
module.exports.index=async (req,res)=>{
  const allListings= await Listing.find({});
  res.render("index.ejs",{allListings});
}
module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
}
module.exports.showListing=async (req,res)=>{
    let {id}= req.params;
    let userId;
   if(req.user) {userId=req.user._id.toString();
   }
    let favoriteListings = [];
        if (userId) {
            console.log(userId);
            const favorite = await Favorite.findOne({ userId });
            favoriteListings = favorite ? favorite.listingId.map(id => id.toString()) : [];
        }

    const listing =await Listing.findById(id).populate({path:"reviews",populate:{path:"author",}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
  
    res.render("show.ejs",{listing,userId,favoriteListings});
} 
module.exports.createListing = async (req, res, next) => {
  console.dir(req.body.listing);
  const newListing = new Listing(req.body.listing);
  
  newListing.owner = req.user._id;


  
  if (req.files && req.files.length > 0) {
    newListing.images = req.files.map(file => ({
      url: file.path,
      filename: file.filename
    }));
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.destroyListing=async (req,res)=>{
    let {id} =req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}
module.exports.renderEditForm=async (req,res)=>{
    let {id}= req.params;
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.images.length > 0 ? listing.images[0].url : null;
if (originalImageUrl) {
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
}
    res.render("edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing=async (req,res)=>{

  let {id}=req.params;
 
 let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

 if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({ url: file.path, filename: file.filename }));
   listing.images = newImages; 
  }
     await listing.save();
 req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`)
}
module.exports.addToFavourite=async (req, res) => {
   
    const userId=req.user._id.toString();
    const {id:listingId}= req.params;
     
    

    
        let favorite = await Favorite.findOne({ userId });

        let isFavorite = false;

        if (!favorite) {
           
            favorite = new Favorite({ userId, listingId: [listingId] });
            isFavorite = true;
        } else {
            const listingExists = favorite.listingId.some(id => id.toString() === listingId);

            if (listingExists) {
                
                favorite.listingId = favorite.listingId.filter(id => id.toString() !== listingId);
                isFavorite = false;
            } else {
                
                favorite.listingId.push(listingId);
                isFavorite = true;
            }
        }

        await favorite.save();
        // console.log("Updated Favorite:", favorite);
        req.flash("success","All your Favorite Listing!");
        res.json({ success: true, isFavorite });
     
    }
module.exports.Favourite=async (req,res)=>{
    const userId=req.user._id.toString();
    
        let favoriteListings = await Favorite.findOne({ userId });
        if(!favoriteListings){
          req.flash("error", "No favourite listing till now");

           res.render("index.ejs",{allListings:[]});
           return ;
        }

        const listingExists = favoriteListings.listingId;
        const allListings = await Listing.find({ _id: { $in: listingExists } });
       
        res.render("index.ejs",{allListings});
    }
module.exports.payment=async (req, res) => {
    try {
        const {id:listingId}= req.params;
     
      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  
      const options = {
        amount: 1000 * 100, 
        currency: "INR",
        receipt: `receipt_${listingId}`,
      };
  
      const order = await razorpay.orders.create(options);
      res.json({ success: true, orderId: order.id, amount: options.amount });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  module.exports.confirm= async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, listingId, userId } = req.body;
  
      console.log(req.body);
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
  
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
      }
  
      
      await Listing.findByIdAndUpdate(listingId, { tokenPaid: true,tokenPaymentId: razorpay_payment_id,
        buyer: userId });
        await User.findByIdAndUpdate(userId, { $addToSet: {  PaidListings: listingId } });
        const listing = await User.findById(listingId);
        console.log(listing);
      
      res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      console.error("Error verifying payment:", error);
     res.status(500).json({ success: false, message: "Server error" });
    }
  }
  module.exports.paid= async(req,res)=>{
      const userId=req.user._id.toString();
       
          let favoriteListings = await User.findOne({ _id:userId });
          const listingExists = favoriteListings.PaidListings;
         const allListings = await Listing.find({ _id: { $in: listingExists } });
        
          res.render("index.ejs",{allListings});
      
  }
  module.exports.showOwnerBookings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id, tokenPaid: true }).populate("client");
  res.render("booking.ejs", { listings });
};