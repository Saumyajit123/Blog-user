const User = require("../../models/userModels");
const { hashPassword, comparePassword } = require("../../utils/paswordUtils");
const {
  generateSecretKey,
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/tokenUtils");
const {
  registerSchema,
  loginSchema,
} = require("../../validate/authValidation");



class AuthController {
  // REGISTER USER
  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          errors: error.details.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      const { name, email, password } = value;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "User",
        profileImage: {
          url: null,
          public_id: null,
        },
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
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

  // LOGIN
  async login(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          errors: error.details.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      const { email, password } = value;

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check password
      const passwordMatch = await comparePassword(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check allowed roles
      if (user.role !== "User" && user.role !== "Admin") {
        return res.status(403).json({
          success: false,
          message: "Invalid user role",
        });
      }

      // Generate dynamic secret key
      const secretKey = generateSecretKey();

      // Generate access token
      const accessToken = generateAccessToken(
        user._id.toString(),
        user.role,
        secretKey,
      );

      // Generate refresh token
      const refreshToken = generateRefreshToken(
        user._id.toString(),
        user.role,
        secretKey,
      );

      // Hash refresh token
      const refreshTokenHash = await hashPassword(refreshToken);

      // Store authentication information
      user.secretKey = secretKey;
      user.refreshTokenHash = refreshTokenHash;

      await user.save();

      // ADMIN LOGIN
      if (user.role === "Admin") {
        return res.status(200).json({
          success: true,
          message: "Admin login successful",

          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              profileImage: user.profileImage,
            },

            accessToken,
            refreshToken,
            secretKey,
          },
        });
      }

      // USER LOGIN
      if (user.role === "User") {
        return res.status(200).json({
          success: true,
          message: "User login successful",

          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              profileImage: user.profileImage,
            },

            accessToken,
            refreshToken,
            secretKey,
          },
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // LOGOUT
  async logout(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      req.user.secretKey = null;
      req.user.refreshTokenHash = null;

      await req.user.save();

      return res.status(200).json({
        success: true,
        message: `${req.user.role} logout successful`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
