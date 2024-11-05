// schemas/auth.schemas.ts
import Joi from 'joi';
import { validateWalletAddress } from '../utils/validation.utils';

export const authSchemas = {
  connect: Joi.object({
    walletAddress: Joi.string()
      .custom((value, helpers) => {
        if (!validateWalletAddress(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required()
      .messages({
        'any.invalid': 'Invalid wallet address format',
        'any.required': 'Wallet address is required'
      })
  }),

  verify: Joi.object({
    walletAddress: Joi.string()
      .custom((value, helpers) => {
        if (!validateWalletAddress(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required(),
    signature: Joi.string()
      .required()
      .pattern(/^0x[a-fA-F0-9]{130}$/)
      .messages({
        'string.pattern.base': 'Invalid signature format',
        'any.required': 'Signature is required'
      }),
    message: Joi.string()
      .required()
      .messages({
        'any.required': 'Message is required'
      })
  }),

  refresh: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  })
};