const express = require("express");
const router = express.Router();

const authRoute = require("./api/authRoute");
router.use("/api", authRoute);

const userRoute = require("./api/userRoute");
router.use("/api", userRoute);

const blogRoute = require("./api/blogRoute");
router.use("/api", blogRoute);

// EJS:
const ejsAuthRoute = require("./ejs/authEjsRouter");
router.use("/ui", ejsAuthRoute);

const ejsBlogRoute = require("./ejs/blogEjsRouter");
router.use("/ui", ejsBlogRoute);

const ejsUserRoute = require("./ejs/userEjsRouter");
router.use("/ui", ejsUserRoute);



module.exports = router;
