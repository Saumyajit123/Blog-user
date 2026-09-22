const express = require("express");
const router = express.Router();

const ejsUserController = require("../../controller/ejs/userEjsController");
const ejsAuthMiddleware = require("../../middleware/authEjsMiddleware");
const { adminOnly } = require("../../middleware/roleEjsMiddleware");

// Admin dashboard
router.get(
  "/admin/dashboard",
  ejsAuthMiddleware,
  adminOnly,
  ejsUserController.adminDashboard,
);

// User dashboard
router.get(
  "/user/dashboard",
  ejsAuthMiddleware,
  ejsUserController.userDashboard,
);

// All users
router.get("/users", ejsAuthMiddleware, adminOnly, ejsUserController.usersPage);

// Single user
router.get(
  "/users/:id",
  ejsAuthMiddleware,
  adminOnly,
  ejsUserController.singleUser,
);

// Delete user
router.post(
  "/users/delete/:id",
  ejsAuthMiddleware,
  adminOnly,
  ejsUserController.deleteUser,
);

module.exports = router;
