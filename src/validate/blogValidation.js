const Joi = require("joi");

// CREATE BLOG
const createBlogSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.empty": "Blog title is required",
    "string.min": "Blog title must contain at least 3 characters",
    "string.max": "Blog title cannot exceed 200 characters",
    "any.required": "Blog title is required",
  }),

  content: Joi.string().min(10).required().messages({
    "string.empty": "Blog content is required",
    "string.min": "Blog content must contain at least 10 characters",
    "any.required": "Blog content is required",
  }),
});

// UPDATE BLOG
const updateBlogSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.empty": "Blog title is required",
    "string.min": "Blog title must contain at least 3 characters",
    "string.max": "Blog title cannot exceed 200 characters",
    "any.required": "Blog title is required",
  }),

  content: Joi.string().min(10).required().messages({
    "string.empty": "Blog content is required",
    "string.min": "Blog content must contain at least 10 characters",
    "any.required": "Blog content is required",
  }),
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
};
