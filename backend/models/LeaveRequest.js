import mongoose from 'mongoose';

const auditTrailSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['created', 'updated', 'approved', 'rejected', 'cancelled', 'overridden'],
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const leaveRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: 'End date must be greater than or equal to start date',
      },
    },
    type: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: ['casual', 'sick', 'earned', 'unpaid'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [0.5, 'Total days must be at least 0.5'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    managerComment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    hrComment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    auditTrail: {
      type: [auditTrailSchema],
      default: [],
    },
    attachment: {
      type: String, // URL or file path
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
leaveRequestSchema.index({ userId: 1, status: 1 });
leaveRequestSchema.index({ userId: 1, startDate: 1, endDate: 1 });
leaveRequestSchema.index({ managerId: 1, status: 1 });
leaveRequestSchema.index({ createdAt: -1 });

// Virtual for checking if leave is pending
leaveRequestSchema.virtual('isPending').get(function () {
  return this.status === 'pending';
});

// Method to add audit entry
leaveRequestSchema.methods.addAuditEntry = function (action, userId, meta = {}) {
  this.auditTrail.push({
    action,
    by: userId,
    at: new Date(),
    meta,
  });
};

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;

