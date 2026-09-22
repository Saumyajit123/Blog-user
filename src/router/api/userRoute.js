const express = require("express");
const router = express.Router();

const userController = require("../../controller/api/userController");
const authMiddleware = require("../../middleware/authMiddleware");
const { adminMiddleware } = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const Validation = require("../../validate/schemavalidation");
const {
  createUserSchema,
  updateUserSchema,
} = require("../../validate/userValidation");

router.post(
  "/user/create",
  authMiddleware,
  adminMiddleware,
  upload.single("profileImage"),
  Validation.validate(createUserSchema),
  userController.createUser,
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  userController.getAllUsers,
);

router.get(
  "/user/:id",
  authMiddleware,
  adminMiddleware,
  userController.getUserById,
);

router.put(
  "/user/update/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("profileImage"),
  Validation.validate(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/user/delete/:id",
  authMiddleware,
  adminMiddleware,
  userController.deleteUser,
);

module.exports = router;
