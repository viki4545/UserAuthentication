const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const passport = require('passport');



require("./conn");
const User = require("./models/userRegistration");


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

  // make user ID available in templates
app.use(function (req, res, next){
    res.locals.currentUser = req.session.userId;
    next();
  });

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

app.get("/profile", (req, res) => {
    User.findById(req.session.userId)
        .exec((err, foundUser) => {
            if(err){
                console.log(err);
            }else{
                res.render("profile", {title: "UserProfile", records: foundUser});
            }
        });
});

app.get("/login", (req, res) => {
    res.render("login", {title: "Login"});
});


app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username, password: password}, (err, foundUser) => {
        if(!err){
            if(foundUser.email === username){
                if(foundUser.password === password){
                    req.session.userId = foundUser._id;
                    res.redirect("/profile");
                    console.log("User loggedin successfully!!");
                }
            }
        }else{
            console.log(err);
        }
    });
});

app.get("/signup", (req, res) => {
    res.render("signup", {title: "SignUp"});
});

// create a new user in database
app.post("/signup",  upload, (req, res) => {
    const newUser = new User({
        firstname: req.body.fname,
        lastname: req.body.lname,
        age: req.body.age,
        gender: req.body.gender,
        phone: req.body.phone,
        quote: req.body.quote,
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
        image: req.file.filename,
        link: {
            website: req.body.website,
            github: req.body.github,
            twitter: req.body.twitter,
            instagram: req.body.instagram,
            facebook: req.body.facebook
        }
    });
    newUser.save((err,doc)=>{
        if(err) throw err;
        else console.log("User register successfully!!");
    });
    res.redirect("/login");
});



app.listen(port, () => {
    console.log(`Server started at port no ${port}`);
});