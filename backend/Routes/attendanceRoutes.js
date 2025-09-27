import express from 'express';
import { checkIn, checkOut, getAttendanceHistory, getTodayAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

// Check-in and Check-out routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// Get attendance history
router.get('/history', getAttendanceHistory);

// Get today's attendance
router.get('/today', getTodayAttendance);

export default router;
