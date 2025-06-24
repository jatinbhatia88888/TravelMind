const express=require("express");
const wrapAsync= require("../utils/wrapAsyc.js");
const {isLoggedIn,isOwner,validateListing} =require("../middleware.js");
const router=express.Router();
const Listing=require("../models/listing.js");
const ExpressError=require("../utils/ExpressError.js")
const listingController=require("../controllers/listing.js");

const { render } = require("ejs");
const multer =require("multer");
const {storage} = require("../cloudConfig.js");
const upload=multer({storage});
router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync( listingController.createListing) );
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
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
router.post("/pay/verify",isLoggedIn,wrapAsync(listingController.confirm));

module.exports=router;
    
    
   
