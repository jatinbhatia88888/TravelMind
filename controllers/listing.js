const Listing =require("../models/listing.js");
const Favorite=require("../models/favourite.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User= require("../models/user.js");
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
module.exports.createListing=async (req,res,next)=>{
     
     let url =req.file.path;
     let filename=req.file.filename;
     
    const newq= new Listing(req.body.listing);
     console.log(req.body.listing.propertyType);
    newq.owner=req.user._id;
    newq.image={url,filename};
    await newq.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    }
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
    let originalImageUrl= listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250")
    res.render("edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing=async (req,res)=>{

  let {id}=req.params;
 
 let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
 if(typeof req.file !== "undefined") {
 let url =req.file.path;
     let filename=req.file.filename;
     listing.image={url,filename};
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