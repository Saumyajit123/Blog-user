const express = require("express");
const router = express.Router();

const blogController = require("../../controller/api/blogController");
const authMiddleware = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");
const Validation = require("../../validate/schemavalidation");
const {
  createBlogSchema,
  updateBlogSchema,
} = require("../../validate/blogValidation");

router.post(
  "/blog/create",
  authMiddleware,
  upload.single("image"),
  Validation.validate(createBlogSchema),
  blogController.createBlog,
);

router.get("/blogs", blogController.getAllBlogs);

router.get("/blog/:id", blogController.getBlogById);

router.put(
  "/blog/update/:id",
  authMiddleware,
  upload.single("image"),
  Validation.validate(updateBlogSchema),
  blogController.updateBlog,
);

router.delete("/blog/delete/:id", authMiddleware, blogController.deleteBlog);

module.exports = router;
