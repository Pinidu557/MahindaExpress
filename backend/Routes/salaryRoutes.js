import express from 'express';
// ... (imports remain the same)
import {
    getSalariesForMonth,
    saveSalary,
    getSalaryRecord,
    sendSalarySlip,
    downloadSalarySlip,
    deleteSalary
} from '../controllers/salaryController.js';

const router = express.Router();

router.get('/', getSalariesForMonth);
router.get('/:id', getSalaryRecord);
router.post('/save', saveSalary);
router.post('/send-slip/:id', sendSalarySlip);
router.get('/download-slip/:id', downloadSalarySlip);
router.delete('/:id', deleteSalary);

export default router;