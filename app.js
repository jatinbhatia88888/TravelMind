if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// const User= require("./models/user.js")
const express=require("express");
const app=express();
const path =require("path");
const mongoose =require("mongoose");
const dbUrl =process.env.ATLASDB_URL;

const Review=require(path.join(__dirname,"models/review.js"));
const methodOverride =require("method-override");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const ExpressError=require("./utils/ExpressError.js")
app.use(express.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.set("views",path.join(__dirname,"viewl"));
const ejsMate=require("ejs-mate");
app.engine('ejs', ejsMate);
const session =require("express-session");
const MongoStore =require('connect-mongo');
const listingRouter= require("./routes/listing.js");
const reviewRouter =require("./routes/review.js");
const userRouter =require("./routes/user.js");
const searchRouter=require("./routes/search.js");
const flash=require("connect-flash");
app.use(express.json());
const Favorite = require('./models/favourite.js');
const Listing=require('./models/listing.js')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });





const passport= require("passport");
const LocalStrategy =require("passport-local");
const User= require("./models/user.js");
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
})
const sessionOptions = {

    store,
   secret:process.env.SECRET,
   resave:false,
   saveUninitialized: true,
   cookie:{
    expires: Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly: true,
   }
};

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
})

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));






passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success =req.flash("success");
    res.locals.error =req.flash("error");
   
    res.locals.currUser =req.user;
    next();
})










  
app.use("/listings/search",searchRouter);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
main()
.then(()=>{
    console.log("connected to Db");
})
.catch((err)=>{
    console.log("oops error");
})
async function main(){
    await mongoose.connect(dbUrl);
}

app.get("/demouser",async (req,res)=>{
    let fakeUser= new User({
     email:"student@gmail.com",
     username:"delta-student",
    });
 let registerUser =await User.register(fakeUser,"helloworld");
 res.send(registerUser);
});

// app.get("/listings/paid/:id",async(req,res)=>{
//     const userId=req.user._id.toString();
     
//         let favoriteListings = await User.findOne({ _id:userId });
//         const listingExists = favoriteListings.PaidListings;
//        const allListings = await Listing.find({ _id: { $in: listingExists } });
//        //console.log(allListings);
//         //res.send("hello");
//         res.render("index.ejs",{allListings});
    
// })

app.all("*",(req,res,next)=>{
    // console.log("hello")
    next(new ExpressError(404,"Page not Found bless you!"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err});
})
app.use((err,req,res,next)=>{
    res.send("something went wrong")
})
app.listen(8080,()=>{
    console.log("server is lsitening to port 8080");
})
