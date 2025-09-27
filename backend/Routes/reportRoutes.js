import express from 'express';
import { generateAttendanceReport, generateLeaveReport, generatePayrollReport, generateEmployeeReport, generateAllEmployeesReport } from '../controllers/reportController.js';

const router = express.Router();

// Generate attendance report
router.get('/attendance', generateAttendanceReport);

// Generate leave report
router.get('/leave', generateLeaveReport);

// Generate payroll report
router.get('/payroll', generatePayrollReport);

// Generate employee details report
router.get('/employee', generateEmployeeReport);

// Generate all employees report
router.get('/all-employees', generateAllEmployeesReport);

export default router;
