import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'earning', 'payment'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    reference: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
