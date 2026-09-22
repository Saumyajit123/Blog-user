const mongoose = require("mongoose");

const User = require("../../models/userModels");
const { deleteFromCloudinary } = require("../../services/cloudinaryService");
const { createUserSchema } = require("../../validate/userValidation");
const { hashPassword, generatePassword } = require("../../utils/paswordUtils");
const { uploadToCloudinary } = require("../../services/cloudinaryService");
const { sendCredentialsMail } = require("../../services/mailService");

class UserController {
  // CREATE USER:
  async createUser(req, res) {
    try {
      const { error, value } = createUserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { name, email, role } = value;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Generate temporary password:
      const plainPassword = generatePassword();

      const hashedPassword = await hashPassword(plainPassword);

      let profileImage = {
        url: null,
        public_id: null,
      };

      if (req.file) {
        profileImage = await uploadToCloudinary(req.file.buffer, "blog-users");
      }

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        profileImage,
      });

      // Send credentials
      await sendCredentialsMail(email, name, plainPassword);

      return res.status(201).json({
        success: true,
        message: "User created and credentials sent by email",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET ALL USERS:
  async getAllUsers(req, res) {
    try {
      const users = await User.aggregate([
        {
          $project: {
            password: 0,
            secretKey: 0,
            refreshTokenHash: 0,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET SINGLE USER
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const users = await User.aggregate([
        {
          $match: {
            _id: new User.base.Types.ObjectId(id),
          },
        },

        {
          $project: {
            password: 0,
            secretKey: 0,
            refreshTokenHash: 0,
          },
        },
      ]);

      if (!users.length) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: users[0],
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // UPDATE USER
  async updateUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check duplicate email
      if (req.body.email) {
        const existingUser = await User.findOne({
          email: req.body.email,
          _id: {
            $ne: id,
          },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Email already belongs to another user",
          });
        }

        user.email = req.body.email;
      }

      if (req.body.name) {
        user.name = req.body.name;
      }

      if (req.body.role) {
        user.role = req.body.role;
      }

      // Replace profile image
      if (req.file) {
        if (user.profileImage?.public_id) {
          await deleteFromCloudinary(user.profileImage.public_id);
        }

        user.profileImage = await uploadToCloudinary(
          req.file.buffer,
          "blog-users",
        );
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE USER:
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.profileImage?.public_id) {
        await deleteFromCloudinary(user.profileImage.public_id);
      }

      const deletedUser = await User.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UserController();
