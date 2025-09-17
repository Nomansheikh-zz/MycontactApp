const mongoose = require("mongoose");
const contractSchema = new mongoose.Schema({
    name: {type: String,
        required: [true,'Please add a name']},
    email: {type: String, required: [true, 'Please add an email']},
    phone: {type: String, required: [true, 'Please add a phone number']},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Contract", contractSchema);