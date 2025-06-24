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
const searchController=require("../controllers/search.js");
router.route("/")
.get( wrapAsync(searchController.searchListing));
module.exports=router;