const express = require("express");
const router = express.Router();
const {registerUser, loginUser,currentUser} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current", validateToken).get(currentUser);
module.exports = router;