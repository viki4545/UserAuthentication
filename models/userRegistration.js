const mongoose = require('mongoose');

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
        requried: true
    },
    gender:{
        type: String,
        requried: true
    },
    phone:{
        type: String,
        requried: true,
        unique: true
    },
    quote:{
        type: String
    },
    email:{
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
    link:{
            website: {
                type: String
            },
            github: {
                type: String
            },
            twitter: {
                type: String
            },
            instagram: {
                type: String
            },
            facebook: {
                type: String
            }
        }
});

const User = new mongoose.model("User", userSchema);
module.exports = User;