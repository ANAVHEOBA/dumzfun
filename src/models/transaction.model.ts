// models/transaction.model.ts
import mongoose, { Schema } from 'mongoose';

interface ITransactionDocument extends Document {
  transactionId: string;
  walletAddress: string;
  type: string;
  status: string;
  data: any;
  metadata: Record<string, any>;
}

const transactionSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['profile_create', 'profile_update', 'content_create', 'content_update']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
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
transactionSchema.index({ walletAddress: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: 1 });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);