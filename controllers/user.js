const User= require("../models/user.js");
const admin = require("../utils/admin.js");
module.exports.googleAuth = async (req, res) => {
  const { idToken, userType } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        username: name,
        googleUID: uid,
        userType: userType || "traveler"
      });
      await user.save();
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    });

  } catch (error) {
    console.error("ID token verification failed:", error);
    res.status(401).json({ success: false, error: "Invalid ID token" });
  }
};
module.exports.renderSignupForm=(req,res)=>{
    res.render("./signup.ejs");
}
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password, userType } = req.body;

   
    if (!["traveler", "owner"].includes(userType)) {
      req.flash("error", "Invalid user type selected.");
      return res.redirect("/signup");
    }

    const newUser = new User({ email, username, userType });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Travel-World");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
}
module.exports.login=async (req,res)=>{
          
    req.flash("success" ,"Welcome back to Travel-World !");
    
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};
module.exports.renderLoginForm=(req,res)=>{
    res.render("./login.ejs");
}