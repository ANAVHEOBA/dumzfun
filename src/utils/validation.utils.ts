// utils/validation.utils.ts
import { ethers } from 'ethers';
import { CustomError } from './error.utils';

export const validateWalletAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

export const validateSignature = (
  message: string,
  signature: string,
  address: string
): boolean => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateBio = (bio: string): boolean => {
  return bio.length <= 500; // Maximum 500 characters
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateProfileData = (data: {
  username?: string;
  bio?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (data.username && !validateUsername(data.username)) {
    errors.push('Invalid username format. Use 3-20 alphanumeric characters or underscores.');
  }

  if (data.bio && !validateBio(data.bio)) {
    errors.push('Bio must not exceed 500 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};