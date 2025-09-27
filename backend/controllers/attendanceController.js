import Attendance from '../models/attendanceModel.js';
import Leave from '../models/leaveModel.js';

// Constants
const WORK_START_HOUR = 9; // 9 AM
const WORK_END_HOUR = 17;  // 5 PM
const LATE_THRESHOLD_MINUTES = 10; // Grace period
const HALF_DAY_THRESHOLD_HOURS = 3;

// Check-in
export const checkIn = async (req, res) => {
    try {
        const { employee_id } = req.body;
        const now = new Date();
        
        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            employee_id,
            date: {
                $gte: new Date(now.setHours(0,0,0,0)),
                $lt: new Date(now.setHours(23,59,59,999))
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: "Already checked in today" });
        }

        // Calculate status
        const workStartTime = new Date(now.setHours(WORK_START_HOUR, 0, 0, 0));
        const minutesLate = Math.floor((now - workStartTime) / (1000 * 60));
        
        let status = 'on-time';
        if (minutesLate > LATE_THRESHOLD_MINUTES) {
            status = minutesLate >= (HALF_DAY_THRESHOLD_HOURS * 60) ? 'half-day' : 'late';
        }

        const attendance = new Attendance({
            employee_id,
            date: now,
            check_in: now,
            status
        });

        await attendance.save();
        res.status(201).json(attendance);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Check-out
export const checkOut = async (req, res) => {
    try {
        const { employee_id } = req.body;
        const now = new Date();

        const attendance = await Attendance.findOne({
            employee_id,
            date: {
                $gte: new Date(now.setHours(0,0,0,0)),
                $lt: new Date(now.setHours(23,59,59,999))
            },
            check_out: { $exists: false }
        });

        if (!attendance) {
            return res.status(404).json({ message: "No active check-in found" });
        }

        // Calculate total hours and OT
        const checkInTime = new Date(attendance.check_in);
        const totalHours = (now - checkInTime) / (1000 * 60 * 60);
        const workEndTime = new Date(now.setHours(WORK_END_HOUR, 0, 0, 0));
        const otHours = Math.max(0, (now - workEndTime) / (1000 * 60 * 60));

        attendance.check_out = now;
        attendance.total_hours = parseFloat(totalHours.toFixed(2));
        attendance.ot_hours = parseFloat(otHours.toFixed(2));

        await attendance.save();
        res.json(attendance);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get attendance history
export const getAttendanceHistory = async (req, res) => {
    try {
        const { employee_id, start_date, end_date } = req.query;
        
        const query = {
            employee_id,
            date: {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            }
        };

        const attendance = await Attendance.find(query)
            .sort({ date: -1 });

        res.json(attendance);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get today's attendance for all employees
export const getTodayAttendance = async (req, res) => {
    try {
        const today = new Date();
        const attendance = await Attendance.find({
            date: {
                $gte: new Date(today.setHours(0,0,0,0)),
                $lt: new Date(today.setHours(23,59,59,999))
            }
        }).populate('employee_id', 'name department');

        res.json(attendance);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
