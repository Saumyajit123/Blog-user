const express = require("express");
const router = express.Router();

const ejsAuthController = require("../../controller/ejs/authEjsController");
const ejsAuthMiddleware = require("../../middleware/authEjsMiddleware");

// Register
router.get("/register", ejsAuthController.registerPage);

router.post("/register", ejsAuthController.register);

// Login
router.get("/login", ejsAuthController.loginPage);

router.post("/login", ejsAuthController.login);

// Dashboard
router.get("/dashboard", ejsAuthMiddleware, ejsAuthController.dashboard);

// Logout
router.get("/logout", ejsAuthMiddleware, ejsAuthController.logout);



module.exports = router;
