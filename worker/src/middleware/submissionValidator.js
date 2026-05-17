const Joi = require("joi");

module.exports = Joi.object({
  roomId: Joi.string().required(),
  userId: Joi.string().required(),
  code: Joi.string().min(3).required(),
  language: Joi.string()
    .valid("javascript", "python", "java", "cpp")
    .required()
});