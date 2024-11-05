// models/profile.model.ts
import mongoose, { Schema } from 'mongoose';
import { IProfileDocument } from '../types/profile.types';

const socialLinksSchema = new Schema({
  twitter: String,
  github: String,
  discord: String,
  website: String
}, { _id: false });

const profileSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  arweaveId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: 'Avatar must be a valid URL'
    }
  },
  socialLinks: {
    type: socialLinksSchema,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
profileSchema.index({ walletAddress: 1 });
profileSchema.index({ username: 1 });
profileSchema.index({ isActive: 1 });

// Methods
profileSchema.methods.updateVersion = async function(): Promise<void> {
  this.version += 1;
  await this.save();
};

profileSchema.methods.deactivate = async function(): Promise<void> {
  this.isActive = false;
  await this.save();
};

profileSchema.methods.addSocialLink = async function(
  platform: string,
  url: string
): Promise<void> {
  if (!this.socialLinks) {
    this.socialLinks = {};
  }
  this.socialLinks[platform] = url;
  await this.save();
};

export const Profile = mongoose.model<IProfileDocument>('Profile', profileSchema);