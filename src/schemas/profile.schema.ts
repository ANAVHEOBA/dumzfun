// schemas/profile.schemas.ts
import Joi from 'joi';

export const profileSchemas = {
  create: Joi.object({
    username: Joi.string()
      .required()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    bio: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    avatar: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Avatar must be a valid URL'
      }),
    socialLinks: Joi.object({
      twitter: Joi.string()
        .uri()
        .optional(),
      github: Joi.string()
        .uri()
        .optional(),
      discord: Joi.string()
        .pattern(/^.+#\d{4}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Invalid Discord username format'
        }),
      website: Joi.string()
        .uri()
        .optional()
    }).optional()
  }),

  update: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .optional(),
    bio: Joi.string()
      .max(500)
      .allow('')
      .optional(),
    avatar: Joi.string()
      .uri()
      .optional(),
    socialLinks: Joi.object({
      twitter: Joi.string()
        .uri()
        .optional()
        .allow(null),
      github: Joi.string()
        .uri()
        .optional()
        .allow(null),
      discord: Joi.string()
        .pattern(/^.+#\d{4}$/)
        .optional()
        .allow(null),
      website: Joi.string()
        .uri()
        .optional()
        .allow(null)
    }).optional()
  })
};