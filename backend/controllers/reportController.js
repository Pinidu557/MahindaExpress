import PDFDocument from 'pdfkit';
import Attendance from '../models/attendanceModel.js';
import Leave from '../models/leaveModel.js';
import Payroll from '../models/payrollModel.js';
import Staff from '../models/staffModel.js';

// Helper function to format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Generate attendance report
export const generateAttendanceReport = async (req, res) => {
    try {
        const { employee_id, start_date, end_date } = req.query;
        
        // Build query for staff
        const staffQuery = {};
        if (employee_id) {
            staffQuery._id = employee_id;
        }
        
        // Fetch staff with attendance records
        const staff = await Staff.find(staffQuery);
        
        // Process attendance records from staff data
        const attendanceRecords = [];
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        staff.forEach(employee => {
            if (employee.attendance && employee.attendance.length > 0) {
                employee.attendance.forEach(attendance => {
                    const attendanceDate = new Date(attendance.date);
                    if (attendanceDate >= startDate && attendanceDate <= endDate) {
                        attendanceRecords.push({
                            employee_id: {
                                _id: employee._id,
                                name: employee.name,
                                department: employee.department || 'N/A'
                            },
                            date: attendance.date,
                            check_in: attendance.checkIn,
                            check_out: attendance.checkOut,
                            status: attendance.status,
                            total_hours: attendance.workedMinutes ? attendance.workedMinutes / 60 : 0,
                            ot_hours: attendance.otMinutes ? attendance.otMinutes / 60 : 0
                        });
                    }
                });
            }
        });
        
        // Sort by date
        attendanceRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${start_date}_${end_date}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add header with better styling
        doc.fontSize(24).text('Attendance Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text('Mahinda Express - Employee Attendance System', { align: 'center' });
        doc.moveDown(1);
        
        // Add report info box
        const reportInfoY = doc.y;
        doc.rect(50, reportInfoY, 500, 60).stroke();
        doc.fontSize(12)
           .text(`Report Period: ${formatDate(start_date)} to ${formatDate(end_date)}`, 60, reportInfoY + 10)
           .text(`Total Records: ${attendanceRecords.length}`, 60, reportInfoY + 25)
           .text(`Generated: ${formatDate(new Date())}`, 60, reportInfoY + 40);
        
        // Add employee info if specific employee is selected
        if (employee_id && attendanceRecords[0]?.employee_id) {
            doc.text(`Employee: ${attendanceRecords[0].employee_id.name}`, 300, reportInfoY + 10)
               .text(`Department: ${attendanceRecords[0].employee_id.department}`, 300, reportInfoY + 25);
        }
        
        doc.moveDown(3);

        // Create table with better formatting
        const startX = 50;
        let startY = doc.y;
        
        // Table header background
        doc.rect(startX, startY - 5, 500, 25).fill('#f0f0f0');
        doc.fillColor('black');
        
        // Headers with better styling
        doc.fontSize(11).fillColor('#333');
        if (employee_id) {
            // Single employee report
            doc.text('Date', startX + 5, startY)
               .text('Status', startX + 150, startY)
               .text('Hours', startX + 250, startY)
               .text('OT Hours', startX + 350, startY);
        } else {
            // All employees report
            doc.text('Employee', startX + 5, startY)
               .text('Date', startX + 120, startY)
               .text('Status', startX + 220, startY)
               .text('Hours', startX + 320, startY);
        }

        startY += 25;

        // Add records with alternating colors and better formatting
        attendanceRecords.forEach((record, index) => {
            if (startY > 700) { // Check if we need a new page
                doc.addPage();
                startY = 50;
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.rect(startX, startY - 3, 500, 18).fill('#f9f9f9');
                doc.fillColor('black');
            }

            // Format hours display
            const formatHours = (hours) => {
                if (!hours || hours === 0) return '-';
                return hours.toFixed(1);
            };

            // Status color coding
            const getStatusColor = (status) => {
                switch (status.toLowerCase()) {
                    case 'present': return '#22c55e';
                    case 'absent': return '#ef4444';
                    case 'late': return '#f59e0b';
                    case 'leave': return '#3b82f6';
                    default: return '#6b7280';
                }
            };

            doc.fontSize(10);
            
            if (employee_id) {
                // Single employee report
                doc.text(formatDate(record.date), startX + 5, startY);
                doc.fillColor(getStatusColor(record.status))
                   .text(record.status, startX + 150, startY)
                   .fillColor('black');
                doc.text(formatHours(record.total_hours), startX + 250, startY);
                doc.text(formatHours(record.ot_hours), startX + 350, startY);
            } else {
                // All employees report
                doc.text(record.employee_id?.name || 'Unknown', startX + 5, startY);
                doc.text(formatDate(record.date), startX + 120, startY);
                doc.fillColor(getStatusColor(record.status))
                   .text(record.status, startX + 220, startY)
                   .fillColor('black');
                doc.text(formatHours(record.total_hours), startX + 320, startY);
            }

            startY += 20;
        });

        // Add summary with better formatting
        doc.moveDown(3);
        
        // Summary box
        const summaryY = doc.y;
        doc.rect(50, summaryY, 500, 120).stroke();
        doc.fontSize(16).text('Summary', 60, summaryY + 15, { underline: true });
        
        const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
        const totalOTHours = attendanceRecords.reduce((sum, record) => sum + (record.ot_hours || 0), 0);
        const presentCount = attendanceRecords.filter(r => r.status.toLowerCase() === 'present').length;
        const absentCount = attendanceRecords.filter(r => r.status.toLowerCase() === 'absent').length;
        const lateCount = attendanceRecords.filter(r => r.status.toLowerCase() === 'late').length;
        const leaveCount = attendanceRecords.filter(r => r.status.toLowerCase() === 'leave').length;
        
        // Calculate attendance rate
        const totalRecords = attendanceRecords.length;
        const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
        
        doc.fontSize(12)
           .text(`Total Records: ${totalRecords}`, 60, summaryY + 40)
           .text(`Total Working Hours: ${totalHours.toFixed(2)}`, 60, summaryY + 55)
           .text(`Total Overtime Hours: ${totalOTHours.toFixed(2)}`, 60, summaryY + 70)
           .text(`Attendance Rate: ${attendanceRate}%`, 60, summaryY + 85)
           .text(`Present Days: ${presentCount}`, 300, summaryY + 40)
           .text(`Absent Days: ${absentCount}`, 300, summaryY + 55)
           .text(`Late Days: ${lateCount}`, 300, summaryY + 70)
           .text(`Leave Days: ${leaveCount}`, 300, summaryY + 85);

        // Add footer
        doc.moveDown(2);
        doc.fontSize(10)
           .text(`Report generated on: ${formatDate(new Date())}`, { align: 'right' })
           .text(`Mahinda Express - Employee Management System`, { align: 'right' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Generate leave report
export const generateLeaveReport = async (req, res) => {
    try {
        const { employee_id, year } = req.query;
        
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        // Fetch leave records
        const leaveRecords = await Leave.find({
            employee_id,
            start_date: { $gte: startDate },
            end_date: { $lte: endDate }
        })
        .populate('employee_id', 'name department')
        .sort({ start_date: 1 });

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=leave_report_${year}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('Leave Report', { align: 'center' });
        doc.moveDown();
        
        // Add employee info if available
        if (leaveRecords[0]?.employee_id) {
            doc.fontSize(12)
               .text(`Employee: ${leaveRecords[0].employee_id.name}`)
               .text(`Department: ${leaveRecords[0].employee_id.department}`)
               .text(`Year: ${year}`);
        }
        
        doc.moveDown();

        // Create table
        const startX = 50;
        let startY = doc.y;
        doc.fontSize(10);

        // Headers
        doc.text('Leave Type', startX, startY);
        doc.text('Start Date', startX + 100, startY);
        doc.text('End Date', startX + 200, startY);
        doc.text('Status', startX + 300, startY);
        doc.text('Days', startX + 400, startY);

        startY += 20;

        // Add records
        leaveRecords.forEach(record => {
            if (startY > 700) {
                doc.addPage();
                startY = 50;
            }

            const days = Math.ceil((new Date(record.end_date) - new Date(record.start_date)) / (1000 * 60 * 60 * 24)) + 1;

            doc.text(record.leave_type, startX, startY);
            doc.text(formatDate(record.start_date), startX + 100, startY);
            doc.text(formatDate(record.end_date), startX + 200, startY);
            doc.text(record.status, startX + 300, startY);
            doc.text(days.toString(), startX + 400, startY);

            startY += 20;
        });

        // Add summary
        doc.moveDown(2);
        const leaveTypeSummary = leaveRecords.reduce((acc, record) => {
            const days = Math.ceil((new Date(record.end_date) - new Date(record.start_date)) / (1000 * 60 * 60 * 24)) + 1;
            acc[record.leave_type] = (acc[record.leave_type] || 0) + days;
            return acc;
        }, {});

        doc.fontSize(12).text('Leave Summary:', { underline: true });
        Object.entries(leaveTypeSummary).forEach(([type, days]) => {
            doc.text(`${type}: ${days} days`);
        });

        // Finalize PDF
        doc.end();

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Generate payroll report
// Generate employee details report
export const generateEmployeeReport = async (req, res) => {
    try {
        const { employee_id } = req.query;
        
        // Fetch employee with related data
        const employee = await Staff.findById(employee_id)
            .populate('attendance');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Fetch leaves for this employee separately
        const leaves = await Leave.find({ employee_id }).sort({ start_date: 1 });
        employee.leave = leaves;

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=employee_report_${employee._id}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add header with better styling
        doc.fontSize(24).text('Employee Details Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text('Mahinda Express - Individual Employee Report', { align: 'center' });
        doc.moveDown(2);

        // Employee info box
        const infoY = doc.y;
        doc.rect(50, infoY, 500, 100).stroke();
        doc.fontSize(18).text('Employee Information', 60, infoY + 15, { underline: true });
        
        doc.fontSize(12)
           .text(`Name: ${employee.name}`, 60, infoY + 40)
           .text(`Employee ID: ${employee._id}`, 60, infoY + 55)
           .text(`Department: ${employee.department || 'N/A'}`, 60, infoY + 70)
           .text(`Role: ${employee.role}`, 60, infoY + 85);

        doc.moveDown(3);

        // Employment details box
        const empY = doc.y;
        doc.rect(50, empY, 500, 80).stroke();
        doc.fontSize(16).text('Employment Details', 60, empY + 15, { underline: true });
        
        doc.fontSize(12)
           .text(`Join Date: ${formatDate(employee.joinDate || new Date())}`, 60, empY + 40)
           .text(`Status: ${employee.status || 'N/A'}`, 60, empY + 55)
           .text(`Base Salary: ${formatCurrency(employee.salary || 0)}`, 60, empY + 70);

        doc.moveDown(3);

        // Add attendance summary if available
        if (employee.attendance && employee.attendance.length > 0) {
            const attY = doc.y;
            doc.rect(50, attY, 500, 100).stroke();
            doc.fontSize(16).text('Attendance Summary', 60, attY + 15, { underline: true });
            
            const totalAttendance = employee.attendance.length;
            const onTime = employee.attendance.filter(a => a.status === 'on-time').length;
            const late = employee.attendance.filter(a => a.status === 'late').length;
            
            doc.fontSize(12)
               .text(`Total Days: ${totalAttendance}`, 60, attY + 40)
               .text(`On-Time Days: ${onTime}`, 60, attY + 55)
               .text(`Late Days: ${late}`, 60, attY + 70)
               .text(`Attendance Rate: ${((onTime / totalAttendance) * 100).toFixed(2)}%`, 60, attY + 85);

            doc.moveDown(3);
        }

        // Add leave summary if available
        if (employee.leave && employee.leave.length > 0) {
            const leaveY = doc.y;
            doc.rect(50, leaveY, 500, 120).stroke();
            doc.fontSize(16).text('Leave Summary', 60, leaveY + 15, { underline: true });
            
            // Group leaves by type
            const leavesByType = employee.leave.reduce((acc, leave) => {
                acc[leave.leave_type] = (acc[leave.leave_type] || 0) + 1;
                return acc;
            }, {});

            let leaveYPos = leaveY + 40;
            Object.entries(leavesByType).forEach(([type, count]) => {
                doc.fontSize(12).text(`${type}: ${count} times`, 60, leaveYPos);
                leaveYPos += 15;
            });

            doc.moveDown(3);
        }

        // Add footer with better styling
        doc.moveDown(2);
        doc.fontSize(10)
           .text(`Report generated on: ${formatDate(new Date())}`, { align: 'right' })
           .text(`Employee ID: ${employee._id}`, { align: 'right' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const generatePayrollReport = async (req, res) => {
    try {
        const { employee_id, month } = req.query;
        
        // Fetch payroll record
        const payroll = await Payroll.findOne({
            employee_id,
            month: new Date(month)
        }).populate('employee_id', 'name department');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payroll_${month}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('Payroll Statement', { align: 'center' });
        doc.moveDown();

        // Add employee info
        doc.fontSize(12)
           .text(`Employee: ${payroll.employee_id.name}`)
           .text(`Department: ${payroll.employee_id.department}`)
           .text(`Month: ${formatDate(payroll.month)}`)
           .text(`Status: ${payroll.status}`);

        doc.moveDown();

        // Add earnings details
        doc.fontSize(14).text('Earnings', { underline: true });
        doc.fontSize(12)
           .text(`Base Salary: ${formatCurrency(payroll.base_salary)}`)
           .text(`Overtime Pay (${payroll.ot_hours} hours): ${formatCurrency(payroll.ot_pay)}`);

        doc.moveDown();

        // Add deductions
        doc.fontSize(14).text('Deductions', { underline: true });
        doc.fontSize(12)
           .text(`Leave Deductions: ${formatCurrency(payroll.leave_deductions)}`)
           .text(`Late Penalties: ${formatCurrency(payroll.late_penalties)}`);

        doc.moveDown();

        // Add total
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12)
           .text(`Total Hours Worked: ${payroll.total_hours}`)
           .text(`Overtime Hours: ${payroll.ot_hours}`)
           .text(`Net Salary: ${formatCurrency(payroll.net_salary)}`, { bold: true });

        // Add footer
        doc.moveDown(2);
        if (payroll.payment_date) {
            doc.text(`Payment Date: ${formatDate(payroll.payment_date)}`);
        }

        // Finalize PDF
        doc.end();

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Generate all employees report
export const generateAllEmployeesReport = async (req, res) => {
    try {
        // Fetch all employees with their related data
        const employees = await Staff.find()
            .populate('attendance')
            .sort({ department: 1, name: 1 });

        // Fetch all leaves separately and group by employee
        const leaves = await Leave.find().populate('employee_id', 'name department');
        const leavesByEmployee = leaves.reduce((acc, leave) => {
            const empId = leave.employee_id._id.toString();
            if (!acc[empId]) acc[empId] = [];
            acc[empId].push(leave);
            return acc;
        }, {});

        // Attach leaves to employees
        employees.forEach(employee => {
            employee.leave = leavesByEmployee[employee._id.toString()] || [];
        });

        if (!employees || employees.length === 0) {
            return res.status(404).json({ message: 'No employees found' });
        }

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=all_employees_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);

        // Add header with better styling
        doc.fontSize(28).text('All Employees Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`Mahinda Express - Employee Management System`, { align: 'center' });
        doc.moveDown(1);
        
        // Add report info box
        const reportInfoY = doc.y;
        doc.rect(50, reportInfoY, 500, 60).stroke();
        doc.fontSize(12)
           .text(`Report Generated: ${formatDate(new Date())}`, 60, reportInfoY + 10)
           .text(`Total Employees: ${employees.length}`, 60, reportInfoY + 25)
           .text(`Report Type: Comprehensive Employee Details`, 60, reportInfoY + 40);
        
        doc.moveDown(3);

        // Group employees by department
        const employeesByDept = employees.reduce((acc, employee) => {
            const dept = employee.department || 'Unassigned';
            if (!acc[dept]) acc[dept] = [];
            acc[dept].push(employee);
            return acc;
        }, {});

        // Generate report for each department
        Object.entries(employeesByDept).forEach(([department, deptEmployees]) => {
            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }

            // Add department header with better styling
            doc.fontSize(20).text(department, { underline: true });
            doc.moveDown(0.5);
            
            // Add department info
            doc.fontSize(12).text(`Department: ${department} | Employees: ${deptEmployees.length}`, { color: '#666' });
            doc.moveDown(1);

            // Create table with better formatting
            const startX = 50;
            let startY = doc.y;
            
            // Table header background
            doc.rect(startX, startY - 5, 500, 25).fill('#f0f0f0');
            doc.fillColor('black');
            
            // Table headers with better styling
            doc.fontSize(11).fillColor('#333')
               .text('Name', startX + 5, startY)
               .text('Role', startX + 120, startY)
               .text('Contact', startX + 200, startY)
               .text('Status', startX + 300, startY)
               .text('Salary', startX + 380, startY)
               .text('Attendance', startX + 460, startY);

            startY += 25;

            // Add employee rows with alternating colors
            deptEmployees.forEach((employee, index) => {
                if (startY > 700) { // Check if we need a new page
                    doc.addPage();
                    startY = 50;
                }

                const attendanceCount = employee.attendance ? employee.attendance.length : 0;
                const onTimeCount = employee.attendance ? 
                    employee.attendance.filter(a => a.status === 'on-time').length : 0;
                const attendanceRate = attendanceCount > 0 ? 
                    ((onTimeCount / attendanceCount) * 100).toFixed(1) + '%' : 'N/A';

                // Alternate row colors
                if (index % 2 === 0) {
                    doc.rect(startX, startY - 3, 500, 18).fill('#f9f9f9');
                    doc.fillColor('black');
                }

                // Add row content
                doc.fontSize(10)
                   .text(employee.name || 'N/A', startX + 5, startY)
                   .text(employee.role || 'N/A', startX + 120, startY)
                   .text(employee.contact || 'N/A', startX + 200, startY)
                   .text(employee.status || 'N/A', startX + 300, startY)
                   .text(formatCurrency(employee.salary || 0), startX + 380, startY)
                   .text(attendanceRate, startX + 460, startY);

                startY += 20;
            });

            doc.moveDown(2);

            // Add department summary with better styling
            const totalSalary = deptEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
            const activeEmployees = deptEmployees.filter(emp => emp.status === 'active').length;
            const totalAttendance = deptEmployees.reduce((sum, emp) => 
                sum + (emp.attendance ? emp.attendance.length : 0), 0);

            // Department summary box
            const summaryY = doc.y;
            doc.rect(startX, summaryY, 500, 80).stroke();
            doc.fontSize(14).text('Department Summary', startX + 10, summaryY + 10, { underline: true });
            
            doc.fontSize(11)
               .text(`Total Employees: ${deptEmployees.length}`, startX + 20, summaryY + 30)
               .text(`Active Employees: ${activeEmployees}`, startX + 20, summaryY + 45)
               .text(`Total Salary Budget: ${formatCurrency(totalSalary)}`, startX + 20, summaryY + 60);

            doc.moveDown(4);
        });

        // Add overall summary with better formatting
        doc.addPage();
        
        // Summary header
        doc.fontSize(24).text('Overall Summary', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(14).text('Mahinda Express - Employee Analytics', { align: 'center', color: '#666' });
        doc.moveDown(2);

        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(emp => emp.status === 'active').length;
        const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
        const totalAttendance = employees.reduce((sum, emp) => 
            sum + (emp.attendance ? emp.attendance.length : 0), 0);
        const totalLeaves = employees.reduce((sum, emp) => 
            sum + (emp.leave ? emp.leave.length : 0), 0);

        // Key metrics box
        const metricsY = doc.y;
        doc.rect(50, metricsY, 500, 100).stroke();
        doc.fontSize(18).text('Key Metrics', 60, metricsY + 15, { underline: true });
        
        doc.fontSize(14)
           .text(`Total Employees: ${totalEmployees}`, 60, metricsY + 40)
           .text(`Active Employees: ${activeEmployees}`, 60, metricsY + 60)
           .text(`Total Salary Budget: ${formatCurrency(totalSalary)}`, 60, metricsY + 80);

        doc.moveDown(3);

        // Department breakdown with better formatting
        doc.fontSize(18).text('Department Breakdown', { underline: true });
        doc.moveDown(1);
        
        Object.entries(employeesByDept).forEach(([dept, deptEmployees]) => {
            const deptSalary = deptEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
            const deptActive = deptEmployees.filter(emp => emp.status === 'active').length;
            
            // Department box
            const deptY = doc.y;
            doc.rect(50, deptY, 500, 40).stroke();
            doc.fontSize(12)
               .text(`${dept}`, 60, deptY + 10, { underline: true })
               .text(`Employees: ${deptEmployees.length} (${deptActive} active)`, 60, deptY + 25)
               .text(`Budget: ${formatCurrency(deptSalary)}`, 300, deptY + 25);
            
            doc.moveDown(2);
        });

        doc.moveDown(2);

        // Overall statistics box
        const statsY = doc.y;
        doc.rect(50, statsY, 500, 120).stroke();
        doc.fontSize(16).text('Overall Statistics', 60, statsY + 15, { underline: true });
        
        doc.fontSize(12)
           .text(`Total Employees: ${totalEmployees}`, 60, statsY + 40)
           .text(`Active Employees: ${activeEmployees}`, 60, statsY + 55)
           .text(`Inactive Employees: ${totalEmployees - activeEmployees}`, 60, statsY + 70)
           .text(`Total Salary Budget: ${formatCurrency(totalSalary)}`, 60, statsY + 85)
           .text(`Average Salary: ${formatCurrency(totalSalary / totalEmployees)}`, 60, statsY + 100);

        // Add footer with better styling
        doc.moveDown(4);
        doc.fontSize(10)
           .text(`Report generated on: ${formatDate(new Date())}`, { align: 'right' })
           .text(`Total pages: ${doc.info.NumberOfPages}`, { align: 'right' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};