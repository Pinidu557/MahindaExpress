import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    check_in: {
        type: Date,
        required: true
    },
    check_out: {
        type: Date
    },
    status: {
        type: String,
        enum: ['on-time', 'late', 'leave', 'absent', 'half-day'],
        required: true
    },
    total_hours: {
        type: Number,
        default: 0
    },
    ot_hours: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Add indexes for common queries
attendanceSchema.index({ employee_id: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
