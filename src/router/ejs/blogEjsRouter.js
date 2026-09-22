const express = require("express");
const router = express.Router();

const ejsBlogController = require("../../controller/ejs/blogEjsController");
const ejsAuthMiddleware = require("../../middleware/authEjsMiddleware");
const upload = require("../../middleware/uploadMiddleware");

// Public blogs
router.get("/blogs", ejsBlogController.blogsPage);

router.get("/blogs/:id", ejsBlogController.singleBlog);

// Protected blog creation
router.get("/blogs/create", ejsAuthMiddleware, ejsBlogController.createPage);

router.post(
  "/blogs/create",
  ejsAuthMiddleware,
  upload.single("image"),
  ejsBlogController.createBlog,
);

// Edit
router.get("/blogs/edit/:id", ejsAuthMiddleware, ejsBlogController.editPage);

router.post(
  "/blogs/edit/:id",
  ejsAuthMiddleware,
  upload.single("image"),
  ejsBlogController.updateBlog,
);

// Delete
router.post(
  "/blogs/delete/:id",
  ejsAuthMiddleware,
  ejsBlogController.deleteBlog,
);

module.exports = router;
