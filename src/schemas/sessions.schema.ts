// schemas/session.schemas.ts
import Joi from 'joi';

export const sessionSchemas = {
  invalidate: Joi.object({
    sessionId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'Invalid session ID format',
        'any.required': 'Session ID is required'
      })
  }),

  deviceInfo: Joi.object({
    userAgent: Joi.string()
      .optional(),
    ipAddress: Joi.string()
      .ip()
      .optional()
      .messages({
        'string.ip': 'Invalid IP address format'
      }),
    deviceType: Joi.string()
      .valid('mobile', 'tablet', 'desktop')
      .optional()
  })
};