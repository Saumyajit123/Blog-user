const mongoose = require("mongoose");

const Blog = require("../../models/blogModel");

const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../services/cloudinaryService");

class EjsBlogController {
  // ALL BLOGS
  async blogsPage(req, res) {
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
              _id: "$authorData._id",
              name: "$authorData.name",
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return res.render("blogs/index", {
        title: "Discover Stories",
        blogs,
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/dashboard");
    }
  }

  // CREATE PAGE
  createPage(req, res) {
    res.render("blogs/create", {
      title: "Write a Story",
    });
  }

  // CREATE BLOG
  async createBlog(req, res) {
    try {
      const { title, content } = req.body;

      let image = {
        url: null,
        public_id: null,
      };

      if (req.file) {
        image = await uploadToCloudinary(
          req.file.buffer,
          "blog-platform/blogs",
        );
      }

      await Blog.create({
        title,
        content,
        author: req.user._id,
        image,
      });

      req.flash("success", "Your story has been published.");

      return res.redirect("/blogs");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/blogs/create");
    }
  }

  // SINGLE BLOG
  async singleBlog(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        req.flash("error", "Invalid blog ID.");
        return res.redirect("/blogs");
      }

      const result = await Blog.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
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
              _id: "$authorData._id",
              name: "$authorData.name",
              email: "$authorData.email",
            },
          },
        },
      ]);

      if (!result.length) {
        req.flash("error", "Blog not found.");
        return res.redirect("/blogs");
      }

      return res.render("blogs/single", {
        title: result[0].title,
        blog: result[0],
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/blogs");
    }
  }

  // EDIT PAGE
  async editPage(req, res) {
    try {
      const blog = await Blog.findById(req.params.id).lean();

      if (!blog || blog.isDeleted) {
        req.flash("error", "Blog not found.");
        return res.redirect("/blogs");
      }

      if (
        req.user.role !== "Admin" &&
        blog.author.toString() !== req.user._id.toString()
      ) {
        req.flash("error", "You can only edit your own blog.");

        return res.redirect("/blogs");
      }

      return res.render("blogs/edit", {
        title: "Edit Story",
        blog,
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/blogs");
    }
  }

  // UPDATE BLOG
  async updateBlog(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog || blog.isDeleted) {
        req.flash("error", "Blog not found.");
        return res.redirect("/blogs");
      }

      if (
        req.user.role !== "Admin" &&
        blog.author.toString() !== req.user._id.toString()
      ) {
        req.flash("error", "You can only update your own blog.");

        return res.redirect("/blogs");
      }

      blog.title = req.body.title;
      blog.content = req.body.content;

      if (req.file) {
        if (blog.image?.public_id) {
          await deleteFromCloudinary(blog.image.public_id);
        }

        blog.image = await uploadToCloudinary(
          req.file.buffer,
          "blog-platform/blogs",
        );
      }

      await blog.save();

      req.flash("success", "Blog updated successfully.");

      return res.redirect(`/blogs/${blog._id}`);
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect(`/blogs/edit/${req.params.id}`);
    }
  }

  // DELETE BLOG
  async deleteBlog(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog || blog.isDeleted) {
        req.flash("error", "Blog not found.");
        return res.redirect("/blogs");
      }

      // Admin = hard delete
      if (req.user.role === "Admin") {
        if (blog.image?.public_id) {
          await deleteFromCloudinary(blog.image.public_id);
        }

        await Blog.findByIdAndDelete(blog._id);

        req.flash("success", "Blog permanently deleted.");

        return res.redirect("/blogs");
      }

      // User = own blog only
      if (blog.author.toString() !== req.user._id.toString()) {
        req.flash("error", "You can only delete your own blog.");

        return res.redirect("/blogs");
      }

      // Soft delete
      blog.isDeleted = true;
      blog.deletedAt = new Date();

      if (blog.image?.public_id) {
        await deleteFromCloudinary(blog.image.public_id);

        blog.image = {
          url: null,
          public_id: null,
        };
      }

      await blog.save();

      req.flash("success", "Blog moved to trash.");

      return res.redirect("/blogs");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/blogs");
    }
  }
}

module.exports = new EjsBlogController();
