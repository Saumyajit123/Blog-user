const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const ejsAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.session.accessToken;

    if (!token) {
      req.flash("error", "Please login first.");
      return res.redirect("/login");
    }

    const decodedToken = jwt.decode(token);

    if (!decodedToken || !decodedToken.userId) {
      req.session.destroy(() => {
        return res.redirect("/login");
      });

      return;
    }

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      req.session.destroy(() => {
        return res.redirect("/login");
      });

      return;
    }

    if (!user.secretKey) {
      req.session.destroy(() => {
        return res.redirect("/login");
      });

      return;
    }

    const verifiedToken = jwt.verify(token, user.secretKey);

    if (verifiedToken.type !== "access") {
      req.session.destroy(() => {
        return res.redirect("/login");
      });

      return;
    }

    req.user = user;
    req.tokenData = verifiedToken;

    res.locals.currentUser = user;

    next();
  } catch (error) {
    req.session.destroy(() => {
      return res.redirect("/login");
    });
  }
};

module.exports = ejsAuthMiddleware;
