const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        requried: true
    },
    lastname:{
        type: String,
        requried: true  
    },
    age:{
        type: Number,
    },
    gender:{
        type: String,
    },
    phone:{
        type: String,
        unique: true
    },
    quote:{
        type: String
    },
    googleId: {
        type: String
    },
    facebookId: {
        type: String
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        requried: true
    },
    address: {
        type: String
    },
    image: {
        type: String
    },
    source: {
        type: String,
    }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);
module.exports = User;