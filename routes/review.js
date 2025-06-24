const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync= require("../utils/wrapAsyc.js");
const ExpressError=require("../utils/ExpressError.js")
const {listingSchema,reviewSchema} =require("../schema.js");
const Listing=require("../models/listing.js");
const Review =require("../models/review.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");
const  reviewContoller =require("../controllers/reviews.js");
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewContoller.createReview));

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewContoller.destroyRoute));
module.exports=router;