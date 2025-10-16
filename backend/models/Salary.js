import mongoose from 'mongoose';

const SalarySchema = new mongoose.Schema({
    staff: { // Changed from 'employee' to 'staff'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
    },
    monthYear: { type: String, required: true }, // Format: "October 2025"
    status: {
        type: String,
        enum: ['Pending', 'Calculated', 'Paid'],
        default: 'Pending',
    },
    basicSalary:{ type: Number, default:0.00, required: true},
    grossSalary: { type: Number, default: 0.00 },
    totalDeductions: { type: Number, default: 0.00 },
    netSalary: { type: Number, required: true }, // As requested: required

    // Earnings (Can be overwritten in SalaryForm)
    allowances: { type: Number, default: 0.00 },
    overtimePay: { type: Number, default: 0.00 },
    reimbursements: { type: Number, default: 0.00 },
    bonus: { type: Number, default: 0.00 },
    
    // Attendance/Deduction Inputs (Calculated initially, can be modified)
    otHours: { type: Number, default: 0 },
    noPayDays: { type: Number, default: 0 }, 
    salaryAdvance: { type: Number, default: 0.00 }, // Separate from Staff.loan
    loan: { type: Number, default: 0.00 }, // Monthly loan installment, separate from Staff.loan

    // Derived/Calculated fields
    employeeEpf: { type: Number, default: 0.00 }, // 8%
    employerEpf: { type: Number, default: 0.00 }, // 12%
    employerEtf: { type: Number, default: 0.00 }, // 3%
    noPayDeduction: { type: Number, default: 0.00 },
    
}, { timestamps: true });

// Ensure a salary record is unique for a staff member for a given month/year
SalarySchema.index({ staff: 1, monthYear: 1 }, { unique: true });

export default mongoose.model('Salary', SalarySchema);