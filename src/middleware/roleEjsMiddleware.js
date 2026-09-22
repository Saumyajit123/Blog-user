const adminOnly = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "Please login first.");
    return res.redirect("/login");
  }

  if (req.user.role !== "Admin") {
    req.flash("error", "Admin access required.");
    return res.redirect("/dashboard");
  }

  next();
};

const userOnly = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "Please login first.");
    return res.redirect("/login");
  }

  if (req.user.role !== "User") {
    req.flash("error", "User access required.");
    return res.redirect("/dashboard");
  }

  next();
};

module.exports = {
  adminOnly,
  userOnly,
};
