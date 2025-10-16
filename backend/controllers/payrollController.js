import Payroll from '../models/payrollModel.js';
import Attendance from '../models/attendanceModel.js';
import Staff from '../models/staffModel.js';

// Generate monthly payroll for an employee
export async function generatePayroll(req, res) {
        try {
            const { employee_id, month } = req.body;

            // Get employee details
            const employee = await Staff.findById(employee_id);
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }

            // Get start and end date of the month
            const startDate = new Date(month);
            startDate.setDate(1);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            // Get attendance records for the month
            const attendanceRecords = await Attendance.find({
                employee_id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            // Calculate totals
            let totalHours = 0;
            let otHours = 0;
            let lateDays = 0;

            attendanceRecords.forEach(record => {
                totalHours += record.total_hours || 0;
                otHours += record.ot_hours || 0;
                if (record.status === 'late') lateDays++;
            });

            // Calculate pay components
            const baseSalary = employee.salary || 0;
            const otRate = (baseSalary / (22 * 8)) * 1.5; // OT rate = 1.5 times hourly rate
            const otPay = otHours * otRate;
            
            // Calculate deductions
            const lateDeduction = lateDays * (baseSalary / 30 * 0.1); // 10% of daily wage per late day
            
            // Calculate net salary
            const netSalary = baseSalary + otPay - lateDeduction;

            // Create payroll record
            const payroll = new Payroll({
                employee_id,
                month: startDate,
                base_salary: baseSalary,
                total_hours: totalHours,
                ot_hours: otHours,
                ot_pay: otPay,
                late_penalties: lateDeduction,
                net_salary: netSalary
            });

            await payroll.save();
            res.status(201).json(payroll);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
}

// Get payroll history
export async function getPayrollHistory(req, res) {
        try {
            const { employee_id, year } = req.query;
            
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);

            const payrolls = await Payroll.find({
                employee_id,
                month: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ month: -1 });

            res.json(payrolls);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
}

// Approve payroll
export async function approvePayroll(req, res) {
        try {
            const { payroll_id } = req.body;

            const payroll = await Payroll.findById(payroll_id);
            if (!payroll) {
                return res.status(404).json({ message: "Payroll not found" });
            }

            payroll.status = 'approved';
            await payroll.save();

            res.json(payroll);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
}

// Mark payroll as paid
export async function markAsPaid(req, res) {
        try {
            const { payroll_id } = req.body;

            const payroll = await Payroll.findById(payroll_id);
            if (!payroll) {
                return res.status(404).json({ message: "Payroll not found" });
            }

            payroll.status = 'paid';
            payroll.payment_date = new Date();
            await payroll.save();

            res.json(payroll);

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
}
