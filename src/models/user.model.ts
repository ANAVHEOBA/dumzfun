// models/user.model.ts
import mongoose, { Schema } from 'mongoose';
import { IUserDocument } from '../types/user.types';
import { WalletService } from '../services/wallet.service';

const userSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  nonce: {
    type: String,
    required: true,
    default: () => WalletService.generateNonce()
  },
  roles: [{
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: ['user']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  ensName: {
    type: String,
    sparse: true
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.__v;
      delete ret.nonce;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ walletAddress: 1 });
userSchema.index({ ensName: 1 }, { sparse: true });
userSchema.index({ roles: 1 });

// Methods
userSchema.methods.compareNonce = async function(nonce: string): Promise<boolean> {
  return this.nonce === nonce;
};

userSchema.methods.generateNewNonce = async function(): Promise<string> {
  this.nonce = WalletService.generateNonce();
  await this.save();
  return this.nonce;
};

// Middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('walletAddress')) {
    try {
      const ensName = await WalletService.getENSName(this.walletAddress);
      if (ensName) {
        this.ensName = ensName;
      }
    } catch (error) {
      // Continue even if ENS lookup fails
    }
  }
  next();
});

export const User = mongoose.model<IUserDocument>('User', userSchema);