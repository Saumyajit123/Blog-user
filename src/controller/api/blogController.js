const mongoose = require("mongoose");

const Blog = require("../../models/blogModel");
const blogSchema = require("../../validate/blogValidation");

class BlogController {
  // CREATE BLOG:
  async createBlog(req, res) {
    try {
      const { error, value } = blogSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      let image = {
        url: null,
        public_id: null,
      };

      if (req.file) {
        image = await uploadToCloudinary(req.file.buffer, "blog-images");
      }

      const blog = await Blog.create({
        title: value.title,
        content: value.content,
        author: req.user._id,
        image,
      });

      return res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET ALL BLOGS:
  async getAllBlogs(req, res) {
    try {
      const blogs = await Blog.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorData",
          },
        },

        {
          $unwind: {
            path: "$authorData",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            title: 1,
            content: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,

            author: {
              id: "$authorData._id",
              name: "$authorData.name",
              email: "$authorData.email",
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        count: blogs.length,
        data: blogs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET BLOG BY ID:
  async getBlogById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog ID",
        });
      }

      const blogs = await Blog.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorData",
          },
        },

        {
          $unwind: {
            path: "$authorData",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            title: 1,
            content: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,

            author: {
              id: "$authorData._id",
              name: "$authorData.name",
              email: "$authorData.email",
            },
          },
        },
      ]);

      if (!blogs.length) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Blog fetched by ID",
        data: blogs[0],
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // UPDATE BLOG:
  async updateBlog(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog ID",
        });
      }

      const { error, value } = blogSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const blog = await Blog.findById(id);

      if (!blog || blog.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // User can update own blog only
      if (
        req.user.role !== "Admin" &&
        blog.author.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can update only your own blog",
        });
      }

      if (req.file) {
        if (blog.image?.public_id) {
          await deleteFromCloudinary(blog.image.public_id);
        }

        blog.image = await uploadToCloudinary(req.file.buffer, "blog-images");
      }

      blog.title = value.title;
      blog.content = value.content;

      await blog.save();

      return res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: blog,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE BLOG:
  async deleteBlog(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blog ID",
        });
      }

      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // USER -> SOFT DELETE OWN BLOG
      if (req.user.role === "User") {
        if (blog.author.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: "You can delete only your own blog",
          });
        }

        blog.isDeleted = true;
        blog.deletedAt = new Date();

        await blog.save();

        return res.status(200).json({
          success: true,
          message: "Blog soft deleted successfully",
        });
      }

      if (req.user.role === "Admin") {
        if (blog.image?.public_id) {
          await deleteFromCloudinary(blog.image.public_id);
        }

        await Blog.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          message: "Blog permanently deleted successfully",
        });
      }

      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new BlogController();
