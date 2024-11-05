// models/session.model.ts
import mongoose, { Schema } from 'mongoose';
import { ISessionDocument } from '../types/session.types';

const deviceInfoSchema = new Schema({
  type: String,
  os: String,
  browser: String
}, { _id: false });

const sessionSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  userAgent: String,
  ipAddress: String,
  deviceInfo: {
    type: deviceInfoSchema,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ walletAddress: 1, isValid: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 });

// Methods
sessionSchema.methods.invalidate = async function(): Promise<void> {
  this.isValid = false;
  await this.save();
};

sessionSchema.methods.updateLastUsed = async function(): Promise<void> {
  this.lastUsed = new Date();
  await this.save();
};

// Statics
sessionSchema.statics.findValidSession = async function(
  token: string
): Promise<ISessionDocument | null> {
  return this.findOne({
    token,
    isValid: true,
    expiresAt: { $gt: new Date() }
  });
};

sessionSchema.statics.invalidateAllUserSessions = async function(
  walletAddress: string
): Promise<void> {
  await this.updateMany(
    { walletAddress, isValid: true },
    { $set: { isValid: false } }
  );
};

// Middleware
sessionSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

export const Session = mongoose.model<ISessionDocument>('Session', sessionSchema);