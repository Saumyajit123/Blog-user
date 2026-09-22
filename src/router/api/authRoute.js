const express = require("express");
const router = express.Router();

const authController = require("../../controller/api/authController");
const authMiddleware = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const Validation =
    require("../../validate/schemavalidation");
const {
    registerSchema,
    loginSchema,
    refreshTokenSchema
} = require("../../validate/authValidation");


router.post(
  "/register",
  Validation.validate(registerSchema),
  authController.register,
);

router.post("/login", Validation.validate(loginSchema), authController.login);

router.get("/logout", authMiddleware, authController.logout);

module.exports = router;
