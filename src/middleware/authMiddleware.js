const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");

      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.decode(token);

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.secretKey) {
      return res.status(401).json({
        success: false,
        message: "Login session expired",
      });
    }

    const decodedToken = jwt.verify(token, user.secretKey);

    if (decodedToken.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = user;
    req.tokenData = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};


module.exports = authMiddleware;