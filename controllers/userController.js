const aysncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
// @desc register user
// @route POST /api/users/register
// @access Public
const registerUser = aysncHandler(async (req, res) => {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
    }
    const userAvailable = await User.findOne({email});
    if (userAvailable) {
        return res.status(400).json({message: "User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({username, email, password: hashedPassword});
    res.status(200).json({message: "register user", user});
});
// @desc login user
// @route POST /api/users/login
// @access Public
const loginUser = aysncHandler(async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "All fields are required"});
    }
    const user = await User.findOne({email});
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({message: "Invalid credentials"});
    }
    const token = jwt.sign({username: user.username, email: user.email, id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE});
    res.cookie("jwt", token, {httpOnly: true, secure: true, sameSite: "none"});
    res.status(200).json({message: "User logged in successfully",token});s
});
// @desc current user
// @route POST /api/users/current
// @access Private
const currentUser = aysncHandler((req, res) => {
    res.status(200).json({message: "current user"});
});
module.exports = {
    registerUser,
    loginUser,
    currentUser
};