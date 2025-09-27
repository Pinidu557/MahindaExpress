import express from 'express';
import { generatePayroll, getPayrollHistory, approvePayroll, markAsPaid } from '../controllers/payrollController.js';

const router = express.Router();

// Generate monthly payroll
router.post('/generate', generatePayroll);

// Get payroll history
router.get('/history', getPayrollHistory);

// Approve payroll
router.put('/approve', approvePayroll);

// Mark payroll as paid
router.put('/mark-paid', markAsPaid);

export default router;
