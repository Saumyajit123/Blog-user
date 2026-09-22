const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must contain at least 3 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Enter a valid email",
    "string.empty": "Email is required",
  }),

  role: Joi.string().valid("User", "Admin").default("User"),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid("User", "Admin"),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
