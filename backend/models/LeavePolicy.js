import mongoose from 'mongoose';

const leavePolicySchema = new mongoose.Schema(
  {
    leaveType: {
      type: String,
      required: true,
      unique: true,
      enum: ['casual', 'sick', 'earned', 'unpaid'],
    },
    maxDays: {
      type: Number,
      required: true,
      min: 0,
    },
    carryForward: {
      type: Boolean,
      default: false,
    },
    maxCarryForwardDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiresDocument: {
      type: Boolean,
      default: false,
    },
    businessDaysOnly: {
      type: Boolean,
      default: false, // If false, counts calendar days
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

leavePolicySchema.index({ leaveType: 1 }, { unique: true });

const LeavePolicy = mongoose.model('LeavePolicy', leavePolicySchema);

export default LeavePolicy;

