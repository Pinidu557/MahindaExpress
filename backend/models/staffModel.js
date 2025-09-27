import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    role: {
      type: String,
      enum: ["Driver", "Conductor", "Manager", "Supervisor", "Maintenance", "Admin"],
      required: true,
    },
    assignedBus: {
      type: String,
      default: null,
    },
    attendance: [
      {
        date: { type: Date, default: Date.now }, // ✅ no () so it uses current date when saving
        status: {
          type: String,
          enum: ["Present", "Absent", "Leave"],
          default: "Present",
        },
        // Optional leave type metadata. When status is 'Absent', this can specify 'NoPay' or 'Paid'.
        leaveType: {
          type: String,
          enum: ["NoPay", "Paid"],
          required: false,
        },
        checkIn: { type: Date },
        checkOut: { type: Date },
        workedMinutes: { type: Number, default: 0, min: 0 },
        otMinutes: { type: Number, default: 0, min: 0 },
      },
    ],
    salary: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Payroll fields
    basicSalary: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    reimbursements: { type: Number, default: 0, min: 0 },
    salaryAdvance: { type: Number, default: 0, min: 0 },
    loan: { type: Number, default: 0, min: 0 },
    // Aggregate overtime hours for the staff member
    otHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Shift schedule for OT calculations (minutes from midnight)
    shiftStartMinutes: { type: Number, default: 9 * 60, min: 0, max: 24 * 60 },
    shiftEndMinutes: { type: Number, default: 17 * 60, min: 0, max: 24 * 60 },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);
