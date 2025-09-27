import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    month: {
        type: Date,
        required: true
    },
    base_salary: {
        type: Number,
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
    ot_pay: {
        type: Number,
        default: 0
    },
    leave_deductions: {
        type: Number,
        default: 0
    },
    late_penalties: {
        type: Number,
        default: 0
    },
    net_salary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'approved', 'paid'],
        default: 'draft'
    },
    payment_date: {
        type: Date
    }
}, {
    timestamps: true
});

// Add indexes for common queries
payrollSchema.index({ employee_id: 1, month: 1 });
payrollSchema.index({ status: 1 });

export default mongoose.model('Payroll', payrollSchema);
