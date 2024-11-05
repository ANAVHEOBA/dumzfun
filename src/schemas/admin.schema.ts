// schemas/admin.schemas.ts
import Joi from 'joi';
import { UserRole } from '../types/user.types';

export const adminSchemas = {
  updateRoles: Joi.object({
    roles: Joi.array()
      .items(Joi.string().valid(...Object.values(UserRole)))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one role must be specified',
        'any.required': 'Roles are required',
        'any.only': 'Invalid role specified'
      })
  }),

  userQuery: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be greater than 0'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be greater than 0',
        'number.max': 'Limit cannot exceed 100'
      }),
    sortBy: Joi.string()
      .valid('createdAt', 'username', 'walletAddress')
      .default('createdAt'),
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
  })
};