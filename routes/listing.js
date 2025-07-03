const express=require("express");
const wrapAsync= require("../utils/wrapAsyc.js");
const {isLoggedIn,isOwner,validateListing,owner} =require("../middleware.js");
const router=express.Router();
const Listing=require("../models/listing.js");
const ExpressError=require("../utils/ExpressError.js")
const listingController=require("../controllers/listing.js");
const Booking = require("../models/Booking.js");
const { render } = require("ejs");
const multer =require("multer");
const {storage} = require("../cloudConfig.js");
const upload=multer({storage});
router.get('/plantrip', (req, res) => {
  res.render('plan');
});
router.post('/plantrip/itinerary',isLoggedIn,wrapAsync(listingController.generateItinerary));
router.post("/pay/verify",isLoggedIn,wrapAsync(listingController.confirm));
router.get("/owner/bookings", isLoggedIn, owner, wrapAsync(listingController.showOwnerBookings));
router.get("/plantrip/result", (req, res) => {
   console.log("working");
  const data = req.session.itineraryData;
  if (!data) return res.redirect("/listings/plantrip");
  res.render("itinerary.ejs", data);
});


router.post("/check-availability/:id",listingController.checkavailability);


router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,upload.array('listing[images]'),validateListing,wrapAsync( listingController.createListing) );
router.route("/favourite/:id")
.post(isLoggedIn,wrapAsync( listingController.addToFavourite) )
.get(isLoggedIn,wrapAsync(listingController.Favourite));
router.route("/paid/:id")
.get(isLoggedIn,wrapAsync(listingController.paid));
router.route("/payment/:id")
.post(isLoggedIn,wrapAsync(listingController.payment));
router.get("/new",isLoggedIn,listingController.renderNewForm);
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.array('listing[images]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


module.exports=router;
    
    
   
