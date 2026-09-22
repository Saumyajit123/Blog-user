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

class EjsAuthController {
  // REGISTER PAGE
  registerPage(req, res) {
    res.render("auth/register", {
      title: "Create Account",
    });
  }

  // REGISTER
  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((err) => {
          req.flash("error", err.message);
        });

        return res.redirect("/register");
      }

      const { name, email, password } = value;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        req.flash("error", "Email is already registered.");
        return res.redirect("/register");
      }

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

      req.flash("success", "Account created successfully. Please login.");

      return res.redirect("/login");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/register");
    }
  }

  // LOGIN PAGE
  loginPage(req, res) {
    res.render("auth/login", {
      title: "Login",
    });
  }

  // LOGIN
  async login(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((err) => {
          req.flash("error", err.message);
        });

        return res.redirect("/login");
      }

      const { email, password } = value;

      const user = await User.findOne({ email });

      if (!user) {
        req.flash("error", "Invalid email or password.");

        return res.redirect("/login");
      }

      const passwordMatch = await comparePassword(password, user.password);

      if (!passwordMatch) {
        req.flash("error", "Invalid email or password.");

        return res.redirect("/login");
      }

      // Generate dynamic secret
      const secretKey = generateSecretKey();

      const accessToken = generateAccessToken(
        user._id.toString(),
        user.role,
        secretKey,
      );

      const refreshToken = generateRefreshToken(
        user._id.toString(),
        user.role,
        secretKey,
      );

      const refreshTokenHash = await hashPassword(refreshToken);

      user.secretKey = secretKey;
      user.refreshTokenHash = refreshTokenHash;

      await user.save();

      // Store authentication information
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      req.session.secretKey = secretKey;

      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      };

      req.flash("success", `Welcome back, ${user.name}!`);

      return res.redirect("/dashboard");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/login");
    }
  }

  // DASHBOARD
  dashboard(req, res) {
    if (req.user.role === "Admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/user/dashboard");
  }

  // LOGOUT
  async logout(req, res) {
    try {
      if (req.user) {
        req.user.secretKey = null;
        req.user.refreshTokenHash = null;

        await req.user.save();
      }

      req.session.destroy((error) => {
        if (error) {
          return res.redirect("/dashboard");
        }

        return res.redirect("/login");
      });
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/dashboard");
    }
  }
}

module.exports = new EjsAuthController();
