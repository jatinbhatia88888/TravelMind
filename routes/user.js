const express= require("express");
const router= express.Router();
const User= require("../models/user.js")
const wrapAsnyc=require("../utils/wrapAsyc.js")
const passport= require("passport");
const {saveRedirectUrl}=require("../middleware.js")
const userController =require("../controllers/user.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsnyc(userController.signup))
router.route("/google-auth")
.post(userController.googleAuth);
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate('local',{failureRedirect:'/login',failureFlash:true,}),userController.login);
router.get("/logout",userController.logout)
router.post("/googlelogin",userController.googleLogin)
module.exports=router;