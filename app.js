require("dotenv").config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require("./conn");

const port = process.env.port || 3000;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// use sessions for tracking logins
app.use(session({
    secret: 'treehouse loves you',
    resave: true,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/userRegistration");

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username});
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/profile",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async(accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    const newUser = {
        googleId: profile.id,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        username: profile.emails[0].value,
        image: profile.photos[0].value
    }
    try{
        let user = await User.findOne({googleId: profile.id});
        if(user){
            console.log("User already registered!!");
            cb(null, user)
        }else{
            user = await User.create(newUser)
            console.log("Google User created successfully!!");
            cb(null, user)
        }
    }catch(err){
        console.log(err);
    }
    
  }   
));


// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/profile",
    profileFields: ['id', 'displayName','name','photos', 'emails']
  },
  async(accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    const newUser = {
        facebookId: profile.id,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        username: profile.emails[0].value,
        image: profile.photos[0].value
    }
    try{
        let user = await User.findOne({facebookId: profile.id});
        if(user){
            console.log("User already registered!!");
            cb(null, user)
        }else{
            user = await User.create(newUser)
            console.log("Facebook User created successfully!!");
            cb(null, user)
        }
    }catch(err){
        console.log(err);
    }
  }
));


// for image uploading
const Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename:(req,file,cb) => {
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
});

const upload = multer({storage: Storage}).single('file');


// routing
app.get("/", (req, res) => {
    res.render("home", {title: "Home"});
});


// google Oauth routing
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile","email"] })
);

app.get("/auth/google/profile",
        passport.authenticate("google", { failureRedirect: "/signup" }),(req, res) => {
        res.redirect("/profile");
});


// facebook oauth routing
app.get('/auth/facebook',
  passport.authenticate('facebook', {scope: ["email"]}));

app.get('/auth/facebook/profile',
  passport.authenticate('facebook', { failureRedirect: '/signup' }),(req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

app.get("/profile", (req, res) => {
       if(req.isAuthenticated()){
            User.findById(req.user.id, (err, foundUser) => {
                if(err){
                    console.log(err);
                }else{  
                    if(foundUser){
                        res.render("profile", {title: "UserProfile", records: foundUser});
                    } 
                }
            });
       }else{
           res.redirect("/login");
       }
    // res.send("you are a valid user");
});

app.get("/login", (req, res) => {
    res.render("login", {title: "Login"});
});


app.post("/login", (req, res) => {
   passport.authenticate("local", (err, user, info) =>{
       if(err){
           console.log(err);
        }
       if (!user) { 
             res.redirect('/login'); 
        }
        req.logIn(user, (err) => {
         if (err) { 
             console.log(err); 
            }
            return res.redirect('/profile');
            console.log("User login successfully!!");
       });
     })(req, res);
});

app.get("/signup", (req, res) => {
    res.render("signup", {title: "SignUp"});
});

// create a new user in database
app.post("/signup",  upload, (req, res) => {
    User.register({
        firstname: req.body.fname,
        lastname: req.body.lname,
        age: req.body.age,
        gender: req.body.gender,
        phone: req.body.phone,
        quote: req.body.quote,
        username: req.body.username,
        address: req.body.address,
        image: req.file.filename,
    },req.body.password, (err, user) => {
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,() => {
                res.redirect("/profile")
                console.log("User registered successfully!!");
            });
        }
    });
});

app.get("/update", async(req, res) => {
    try{
        const id = req.query.id;

        const userData = await User.findById({_id:id});

        if(userData){
            res.render("update", {records:userData, title: "Updateprofile"});
        }else{
            res.redirect("/login");
        }
    }catch(error){
        console.log(error);
    }
    
});

app.post("/update",  upload, async(req, res) => {

    try {
        const userData = User.findByIdAndUpdate(req.body.user_id, 
            {$set:{
                firstname: req.body.fname,
                lastname: req.body.lname,
                age: req.body.age,
                gender: req.body.gender, 
                username: req.body.username, 
                phone: req.body.phone, 
                quote: req.body.quote,
                address: req.body.address,
                image: req.file.filename
         }});
    } catch (error) {
        console.log(error);
    }
   
     console.log("User updated successfully!!");   
     res.redirect("/profile");
   });

app.post("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server started at port no ${port}`);
});