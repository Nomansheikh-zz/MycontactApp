const aysncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = aysncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(authHeader);
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error("User is not authorized");
            }
            req.user = decoded.user;
            next();
        });
        if (!token) {
            res.status(401);
            throw new Error("User is not authorized or token is missing");
        }
    }
});
module.exports = validateToken;