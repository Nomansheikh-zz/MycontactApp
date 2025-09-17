const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {type: String,
    required: [true,'Please add a user name']},
    email: {type: String, required: [true, 'Please add an email'],unique: [true,'Email already exists'],email: true},
    password: {type: String, required: [true, 'Please add a password']},
    timestamp: {type: Date, default: Date.now}
});
module.exports = mongoose.model("User", userSchema);