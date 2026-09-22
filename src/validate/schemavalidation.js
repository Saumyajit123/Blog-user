class Validation {
  static validate(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        // API request
        if (req.originalUrl.startsWith("/api")) {
          return res.status(400).json({
            success: false,
            errors,
          });
        }

        // EJS request
        req.flash("error", errors.map((err) => err.message).join(", "));

        return res.redirect("back");
      }

      req.body = value;
      next();
    };
  }
}

module.exports = Validation;
