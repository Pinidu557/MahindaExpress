import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    leave_type: {
        type: String,
        enum: ['sick', 'annual', 'casual', 'unpaid'],
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: true
    },
    approver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    approval_date: {
        type: Date
    }
}, {
    timestamps: true
});

// Add indexes for common queries
leaveSchema.index({ employee_id: 1, status: 1 });
leaveSchema.index({ start_date: 1, end_date: 1 });

export default mongoose.model('Leave', leaveSchema);
