const express = require("express");
const router = express.Router();

const authRoute = require("./api/authRoute");
router.use('/api', authRoute);

const userRoute = require("./api/userRoute");
router.use('/api', userRoute);

const blogRoute = require("./api/blogRoute");
router.use('/api', blogRoute);

module.exports = router;