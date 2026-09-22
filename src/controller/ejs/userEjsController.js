const User = require("../../models/userModels");
const Blog = require("../../models/blogModel");

class EjsUserController {

  // ADMIN DASHBOARD
  async adminDashboard(req, res) {
    try {
      const totalUsers = await User.countDocuments();

      const totalBlogs = await Blog.countDocuments({
        isDeleted: false,
      });

      const totalAdmins = await User.countDocuments({
        role: "Admin",
      });

      const totalNormalUsers = await User.countDocuments({
        role: "User",
      });

      const recentUsers = await User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const recentBlogs = await Blog.aggregate([
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
            createdAt: 1,
            authorName: "$authorData.name",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);

      return res.render("dashboard/admin", {
        title: "Admin Dashboard",
        totalUsers,
        totalBlogs,
        totalAdmins,
        totalNormalUsers,
        recentUsers,
        recentBlogs,
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/dashboard");
    }
  }

  // USER DASHBOARD
  async userDashboard(req, res) {
    try {
      const totalBlogs = await Blog.countDocuments({
        author: req.user._id,
        isDeleted: false,
      });

      const recentBlogs = await Blog.find({
        author: req.user._id,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return res.render("dashboard/user", {
        title: "My Dashboard",
        totalBlogs,
        recentBlogs,
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/dashboard");
    }
  }

  // ALL USERS
  async usersPage(req, res) {
    try {
      const users = await User.find()
        .select("name email role profileImage createdAt")
        .sort({ createdAt: -1 })
        .lean();

      return res.render("users/index", {
        title: "User Management",
        users,
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/admin/dashboard");
    }
  }

  // SINGLE USER
  async singleUser(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select("name email role profileImage createdAt")
        .lean();

      if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/users");
      }

      const blogCount = await Blog.countDocuments({
        author: user._id,
        isDeleted: false,
      });

      return res.render("users/single", {
        title: user.name,
        user,
        blogCount,
      });
    } catch (error) {
      req.flash("error", "Unable to load user.");

      return res.redirect("/users");
    }
  }

  // DELETE USER
  async deleteUser(req, res) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/users");
      }

      if (user._id.toString() === req.user._id.toString()) {
        req.flash("error", "You cannot delete your own account.");

        return res.redirect("/users");
      }

      await User.findByIdAndDelete(req.params.id);

      req.flash("success", "User deleted successfully.");

      return res.redirect("/users");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/users");
    }
  }
}

module.exports = new EjsUserController();
