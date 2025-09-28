import express from 'express';
import { applyLeave, updateLeaveStatus, getLeaveHistory, getPendingLeaves } from '../controllers/leaveController.js';

const router = express.Router();

// Apply for leave
router.post('/apply', applyLeave);

// Update leave status (approve/reject)
router.put('/status', updateLeaveStatus);

// Get leave history
router.get('/history', getLeaveHistory);

// Get pending leaves
router.get('/pending', getPendingLeaves);

export default router;
