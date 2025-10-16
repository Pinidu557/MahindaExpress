import Salary from '../models/Salary.js';
import Staff from '../models/staffModel.js'; // Changed from Employee to Staff
import pdf from 'pdfkit';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import moment from 'moment';
import mongoose from 'mongoose';
import transporter from '../config/nodemailer.js';

// Helper to get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Calculation Constants (Example - Customize these) ---
const EPF_EMPLOYEE_RATE = 0.08;
const EPF_EMPLOYER_RATE = 0.12;
const ETF_EMPLOYER_RATE = 0.03;
const WORKING_DAYS_IN_MONTH = 28; // Standard for monthly calculation
const OVERTIME_HOURLY_RATE_FACTOR = 1.5;

// Basic Utility Function
const formatLKR = (amount) => (amount).toFixed(2);

// --- Attendance and OT Processor ---
const processAttendance = (staff, monthYearString) => {
    const targetMonth = moment(monthYearString, 'MMMM YYYY');
    const daysInMonth = targetMonth.daysInMonth();
    
    let totalOtHours = 0;
    let noPayDays = 0;
    
    // Filter attendance records for the target month
    const monthlyAttendance = staff.attendance.filter(att => 
        moment(att.date).year() === targetMonth.year() && moment(att.date).month() === targetMonth.month()
    );

    // Calculate OT and NoPay days
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = targetMonth.clone().date(i);
        const dayOfWeek = currentDate.day(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Customize weekend/holiday logic

        const attRecord = monthlyAttendance.find(att => moment(att.date).date() === i);

        if (!attRecord) {
            // Assume missing record is an absent day, treated as NoPay if it's a workday
            if (!isWeekend) {
                 noPayDays = 0;
            }
        } else {
            // Accumulate OT minutes (converted to hours)
            totalOtHours += (attRecord.otMinutes || 0) / 60; 

            // Count No Pay Days
            if (attRecord.status === 'Absent' || (attRecord.status === 'Leave' && attRecord.leaveType === 'NoPay')) {
                noPayDays += 1;
            }
        }
    }

    return { totalOtHours: parseFloat(formatLKR(totalOtHours)), noPayDays };
};


// --- Core Salary Calculation Logic ---
const calculateSalary = (staff, salaryData) => {
    // Basic salary components from Staff model
    const basicSalary = staff.basicSalary || 0;
    const initialAllowances = staff.allowances || 0;
    const initialBonus = staff.bonus || 0;
    const initialReimbursements = staff.reimbursements || 0;
    const initialLoan = staff.loan || 0; // The total loan amount or default monthly installment from staff model

    // Input fields from SalaryForm (can be manual overrides)
    const { 
        allowances, reimbursements, bonus, 
        otHours, noPayDays, salaryAdvance, loan 
    } = salaryData;

    // 1. Calculate Per-Hour Rate for OT
    // Using a standard 8-hour day rate: (Basic Salary / Working Days / 8 hours)
    const hourlyRate = basicSalary / WORKING_DAYS_IN_MONTH / 8;
    const overtimePay = otHours * hourlyRate * OVERTIME_HOURLY_RATE_FACTOR;

    // 2. Calculate Gross Salary
    // Using potentially overridden amounts for flexibility
    const grossSalary = basicSalary + allowances + overtimePay + reimbursements + bonus;

    // 3. Calculate Deductions
    const epfBase = grossSalary; // EPF is calculated on gross earnings
    const employeeEpf = epfBase * EPF_EMPLOYEE_RATE;
    
    // Deduction for No Pay Days
    const dailyRate = basicSalary / WORKING_DAYS_IN_MONTH;
    const noPayDeduction = noPayDays * dailyRate;

    // Loan amount for the month (using input loan amount)
    const totalLoanDeduction = loan + salaryAdvance; // Combining loan and advance for total

    const totalDeductions = employeeEpf + noPayDeduction + totalLoanDeduction;

    // 4. Calculate Net Pay (Required field as per user)
    const netSalary = grossSalary - totalDeductions;

    // 5. Calculate Employer Contributions
    const employerEpf = epfBase * EPF_EMPLOYER_RATE;
    const employerEtf = epfBase * ETF_EMPLOYER_RATE;

    // Return the calculated object
    return {
        grossSalary: parseFloat(formatLKR(grossSalary)),
        totalDeductions: parseFloat(formatLKR(totalDeductions)),
        netSalary: parseFloat(formatLKR(netSalary)), // Required field
        overtimePay: parseFloat(formatLKR(overtimePay)),
        employeeEpf: parseFloat(formatLKR(employeeEpf)),
        employerEpf: parseFloat(formatLKR(employerEpf)),
        employerEtf: parseFloat(formatLKR(employerEtf)),
        noPayDeduction: parseFloat(formatLKR(noPayDeduction)),
    };
};


// --- PDF Generator Function (No Change in structure) ---
const generateSalarySlip = (doc, staff, salary) => {
    const {
        name, role, email, basicSalary
    } = staff;
    const {
        monthYear, grossSalary, totalDeductions, netSalary,
        allowances, overtimePay, reimbursements, bonus,
        employeeEpf, employerEpf, employerEtf, salaryAdvance, loan,
        noPayDeduction
    } = salary;
    
    // ... (PDF Generation Logic from previous response, using 'staff' and 'role')
    doc.fontSize(16).text('Mahinda Express', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12).text(`SALARY SLIP FOR ${monthYear.toUpperCase()}`, { align: 'center' }).moveDown(1);

    // Employee Info
    doc.fontSize(10).fillColor('#444').text('Employee Information', { underline: true }).moveDown(0.5);
    doc.fillColor('#000');
    doc.text(`Name: ${name}`, { continued: true }).text(`Designation: ${role}`, { align: 'right' }).moveDown(0.2);
    doc.text(`Email: ${email}`).moveDown(1);
    
    const startX = 50;
    const splitX = 300;
    let y = doc.y;
    
    // --- Earnings Section ---
    doc.y = y;
    doc.fontSize(10).fillColor('#004d40').text('EARNINGS', startX, doc.y, { underline: true }).moveDown(0.5);
    doc.fillColor('#000');
    
    doc.text('Basic Salary:', startX).text(`LKR ${formatLKR(basicSalary)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('Allowances:', startX).text(`LKR ${formatLKR(allowances)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('Overtime Pay:', startX).text(`LKR ${formatLKR(overtimePay)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('Reimbursements:', startX).text(`LKR ${formatLKR(reimbursements)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('Bonus:', startX).text(`LKR ${formatLKR(bonus)}`, { align: 'right', continued: true }).moveDown(0.5);

    doc.fillColor('#0d47a1').text('GROSS SALARY:', startX).text(`LKR ${formatLKR(grossSalary)}`, { align: 'right' }).moveDown(1);
    
    let earningsY = doc.y; 

    // --- Deductions Section ---
    doc.y = y; 
    doc.fontSize(10).fillColor('#b71c1c').text('DEDUCTIONS', splitX, doc.y, { underline: true }).moveDown(0.5);
    doc.fillColor('#000');

    doc.text('EPF (8%):', splitX).text(`LKR ${formatLKR(employeeEpf)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('No Pay Days Deduction:', splitX).text(`LKR ${formatLKR(noPayDeduction)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('Salary Advance:', splitX).text(`LKR ${formatLKR(salaryAdvance)}`, { align: 'right', continued: true }).moveDown(0.2);
    doc.text('Loan:', splitX).text(`LKR ${formatLKR(loan)}`, { align: 'right', continued: true }).moveDown(0.5);

    doc.fillColor('#d50000').text('TOTAL DEDUCTIONS:', splitX).text(`LKR ${formatLKR(totalDeductions)}`, { align: 'right' }).moveDown(1);

    // --- Net Salary (After both columns) ---
    doc.y = Math.max(earningsY, doc.y); 
    doc.fillColor('#1b5e20').fontSize(14).text('NET SALARY (Take Home):', startX).text(`LKR ${formatLKR(netSalary)}`, { align: 'right' }).moveDown(1);

    // Employer Contributions
    doc.fontSize(10).fillColor('#444').text('Employer Contributions', { underline: true }).moveDown(0.5);
    doc.fillColor('#000');
    doc.text(`EPF (12%): LKR ${formatLKR(employerEpf)}`, startX).moveDown(0.2);
    doc.text(`ETF (3%): LKR ${formatLKR(employerEtf)}`, startX).moveDown(1);
};


// --- API Functions ---

// 1. GET all salaries for a month (Updated to use Staff and calculate initial NoPay/OT)
export const getSalariesForMonth = async (req, res) => {
    try {
        const { monthYear } = req.query; 
        
        // Find all staff members
        const staffMembers = await Staff.find();
        
        // Find all salary records for the month
        const salaries = await Salary.find({ monthYear }).populate('staff');
        
        const salaryMap = salaries.reduce((map, salary) => {
            map[salary.staff._id.toString()] = salary;
            return map;
        }, {});
        
        const payrollData = staffMembers.map(staff => {
            const salaryRecord = salaryMap[staff._id.toString()];
            
            if (salaryRecord) {
                return salaryRecord;
            } else {
                // Initial calculation for Pending status
                const { totalOtHours, noPayDays } = processAttendance(staff, monthYear);
                
                return {
                    _id: null,
                    staff: staff,
                    monthYear: monthYear,
                    status: 'Pending',
                    
                    // Fields pre-filled from Staff model for calculation form
                    basicSalary: staff.basicSalary,
                    allowances: staff.allowances,
                    bonus: staff.bonus,
                    reimbursements: staff.reimbursements,
                    loan: staff.loan, // Use Staff.loan as initial loan deduction (can be zero if not a monthly installment)
                    
                    // Calculated attendance figures
                    otHours: totalOtHours,
                    noPayDays: noPayDays,

                    // Initial calculation for display (to show basic deduction)
                    // This is optional but helpful for the dashboard
                    netSalary: 0.00, 
                    grossSalary: staff.basicSalary,
                    totalDeductions: 0.00,
                };
            }
        });

        // Calculate card totals based on SAVED salary records
//         const totalGross = salaries.reduce((acc, s) => acc + s.grossSalary, 0);
//         const totalDeductions = salaries.reduce((acc, s) => acc + s.totalDeductions, 0);
//         const totalNetPay = salaries.reduce((acc, s) => acc + s.netSalary, 0);

//         res.status(200).json({
//             payrollData,
//             totals: {
//                 totalGross: formatLKR(totalGross),
//                 totalDeductions: formatLKR(totalDeductions),
//                 totalNetPay: formatLKR(totalNetPay),
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching payroll data' });
//     }
// };

// 3. Filter the fetched salary records to include only 'Calculated' or 'Paid' statuses.
        // This ensures the dashboard totals are financially accurate.
        const finalizedSalaries = salaries.filter(s => 
            s.status === 'Calculated' || s.status === 'Paid'
        );

        // 4. Calculate card totals based on FINALIZED salary records
        // We use the filtered array (finalizedSalaries) for reduction.
        const totalGross = finalizedSalaries.reduce((acc, s) => acc + s.grossSalary, 0);
        const totalDeductions = finalizedSalaries.reduce((acc, s) => acc + s.totalDeductions, 0);
        const totalNetPay = finalizedSalaries.reduce((acc, s) => acc + s.netSalary, 0);
        // --- NEW/UPDATED LOGIC ENDS HERE ---

        res.status(200).json({
            payrollData, // This contains all staff (Pending, Calculated, Paid)
            totals: {    // This contains totals for Calculated/Paid only
                totalGross: formatLKR(totalGross),
                totalDeductions: formatLKR(totalDeductions),
                totalNetPay: formatLKR(totalNetPay),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payroll data' });
    }
};

// 2. GET a single salary record 
export const getSalaryRecord = async (req, res) => {
    try {
        const { id } = req.params;
        // Populate 'staff' (was 'employee')
        const salary = await Salary.findById(id).populate('staff'); 
        if (!salary) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        res.status(200).json(salary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching salary record' });
    }
};

// 3. Save/Update Salary Calculation 
export const saveSalary = async (req, res) => {
    try {
        const {
            staffId, // Changed from employeeId to staffId
            monthYear,
            _id, 
            ...salaryInputs
        } = req.body;

        const staff = await Staff.findById(staffId); // Changed from Employee to Staff
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        
        // Full Calculation
        const calculated = calculateSalary(staff, salaryInputs);

        const salaryData = {
            staff: staffId, // Changed from employee to staff
            monthYear,
            status: 'Calculated',
            ...salaryInputs,
            ...calculated
        };

        let salary;
        if (_id) {
            // Update existing record
            salary = await Salary.findByIdAndUpdate(_id, salaryData, { new: true, runValidators: true });
        } else {
            // Create new record
            salary = await Salary.create(salaryData);
        }

        res.status(200).json(salary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving salary calculation' });
    }
};

// 4. Generate and Send Salary Slip Email
export const sendSalarySlip = async (req, res) => {
    try {
        const { id } = req.params;
        const salary = await Salary.findById(id).populate('staff'); // Changed from employee to staff
        if (!salary || salary.status !== 'Calculated') {
            return res.status(400).json({ message: 'Cannot send slip. Record not found or not calculated.' });
        }

        const staff = salary.staff; // Changed from employee to staff
        const pdfFileName = `${staff.name.replace(/\s/g, '_')}_${salary.monthYear.replace(/\s/g, '-')}_Slip.pdf`;
        const pdfPath = path.join(__dirname, '..', 'temp_slips', pdfFileName);
        
        if (!fs.existsSync(path.join(__dirname, '..', 'temp_slips'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'temp_slips'));
        }

        // 1. Generate PDF
        const doc = new pdf({ margin: 50 });
        doc.pipe(fs.createWriteStream(pdfPath));
        generateSalarySlip(doc, staff, salary);
        doc.end();

        await new Promise(resolve => doc.on('finish', resolve));

        // 2. Configure and Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: staff.email,
            subject: `Your Salary Slip for ${salary.monthYear}`,
            text: `Dear ${staff.name},\n\nPlease find your salary slip for ${salary.monthYear} attached.\n\nThanks,\nPayroll Team`,
            attachments: [{
                filename: pdfFileName,
                path: pdfPath
            }]
        };

        await transporter.sendMail(mailOptions);
        
        // 3. Update Status to 'Paid'
        salary.status = 'Paid';
        await salary.save();

        // 4. Clean up temporary PDF file
        fs.unlinkSync(pdfPath);

        res.status(200).json({ message: 'Salary slip sent and status updated to Paid' });

    } catch (error) {
        console.error("Error sending salary slip:", error);
        res.status(500).json({ message: 'Error generating or sending salary slip' });
    }
};

// 5. Download Salary Slip PDF
export const downloadSalarySlip = async (req, res) => {
    try {
        const { id } = req.params;
        const salary = await Salary.findById(id).populate('staff'); // Changed from employee to staff
        if (!salary) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        
        const staff = salary.staff; // Changed from employee to staff
        const pdfFileName = `${staff.name.replace(/\s/g, '_')}_${salary.monthYear.replace(/\s/g, '-')}_Slip.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
        
        const doc = new pdf({ margin: 50 });
        generateSalarySlip(doc, staff, salary);
        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error("Error generating download:", error);
        res.status(500).json({ message: 'Error generating salary slip for download' });
    }
};

// 6. Delete Salary Record
export const deleteSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Salary.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        res.status(200).json({ message: 'Salary record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting salary record' });
    }
};

// --- New API Function for Update Prep Data ---
export const getSalaryUpdatePrepData = async (req, res) => {
    try {
        const { id } = req.params; // This is the salary ID
        
        // 1. Fetch the SAVED Salary record
        const savedSalary = await Salary.findById(id).populate('staff'); 
        if (!savedSalary) {
            return res.status(404).json({ message: 'Salary record not found' });
        }

        const staff = savedSalary.staff;
        const monthYear = savedSalary.monthYear;

        // 2. Process CURRENT Attendance from the Staff model
        // This ensures the OT and NoPayDays are always based on the latest staff data
        const { totalOtHours, noPayDays } = processAttendance(staff, monthYear);
        
        // 3. Construct the response payload using STAFF model data as the source 
        //    for inputs, and the SAVED Salary ID for the update.
        const updateData = {
            // IDs/Metadata
            _id: savedSalary._id, // The ID of the existing salary record (for update)
            staffId: staff._id, 
            monthYear: monthYear,
            
            // --- CORE INPUTS: LOADED FROM STAFF MODEL ---
            // These will override whatever was previously saved in the Salary document
            basicSalary: staff.basicSalary || 0,
            allowances: staff.allowances || 0, 
            reimbursements: staff.reimbursements || 0,
            bonus: staff.bonus || 0, 

            // --- ATTENDANCE/OT: LOADED FROM LIVE ATTENDANCE PROCESSING ---
            otHours: totalOtHours,
            noPayDays: noPayDays,
            
            // --- DEDUCTION INPUTS: LOADED FROM SAVED SALARY RECORD (These are manual inputs) ---
            // If the user entered a loan/advance last time, we show that to prevent accidental zeroing.
            // If you want loan/advance to always start from Staff.loan + 0 advance, change these lines.
            salaryAdvance: savedSalary.salaryAdvance || 0, 
            loan: savedSalary.loan || staff.loan || 0, // Using saved loan amount, falling back to staff default
            
            // STAFF DISPLAY DETAILS (Populated)
            staffName: staff.name,
            staffRole: staff.role,
            staffEmail: staff.email,
        };

        res.status(200).json(updateData);
    } catch (error) {
        console.error("Error fetching update prep data:", error);
        res.status(500).json({ message: 'Error fetching salary update data' });
    }
};