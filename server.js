const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/dbConnection");
connectDB();
const app = express();
const port = process.env.PORT || 5000;
console.log(process.env.PORT);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

