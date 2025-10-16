 import Staff from "../models/staffModel.js";

// ✅ Create Staff
export const createStaff = async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate email/phone
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get All Staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (error) {
    console.error("Error in getAllStaff:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get One Staff
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Staff
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Staff
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Assign Bus
export const assignBus = async (req, res) => {
  try {
    const { assignedBus } = req.body;
    if (!assignedBus)
      return res.status(400).json({ message: "Bus ID is required" });

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { assignedBus },
      { new: true }
    );
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Mark Attendance
export const markAttendance = async (req, res) => {
  try {
    const { status, leaveType } = req.body;
    if (!["Present", "Absent", "Leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const record = { status };
    if ((status === 'Absent' || status === 'Leave') && leaveType) {
      record.leaveType = leaveType; // e.g., 'NoPay' or 'Paid'
    }
    staff.attendance.push(record);
    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Add/Update OT Hours
export const addOvertime = async (req, res) => {
  try {
    const { hours } = req.body;
    const numericHours = Number(hours);
    if (isNaN(numericHours) || numericHours < 0) {
      return res.status(400).json({ message: "Invalid hours" });
    }
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    staff.otHours = (staff.otHours || 0) + numericHours;
    await staff.save();
    res.json({ message: 'OT hours updated', otHours: staff.otHours, staff });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Check-In
export const checkIn = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    const todayKey = new Date().toDateString();
    let todayRecord = (staff.attendance || []).find(r => new Date(r.date).toDateString() === todayKey);
    if (!todayRecord) {
      todayRecord = { status: 'Present', date: new Date() };
      staff.attendance.push(todayRecord);
    }
    if (todayRecord.checkIn) {
      return res.status(400).json({ message: 'Already checked in' });
    }
    todayRecord.checkIn = new Date();
    await staff.save();
    res.json({ message: 'Checked in', attendance: todayRecord });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Check-Out with worked/OT calc
export const checkOut = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    const todayKey = new Date().toDateString();
    let todayRecord = (staff.attendance || []).find(r => new Date(r.date).toDateString() === todayKey);
    if (!todayRecord || !todayRecord.checkIn) {
      return res.status(400).json({ message: 'Not checked in' });
    }
    if (todayRecord.checkOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }
    todayRecord.checkOut = new Date();
    const workedMs = todayRecord.checkOut - new Date(todayRecord.checkIn);
    const workedMinutes = Math.max(0, Math.round(workedMs / 60000));
    todayRecord.workedMinutes = workedMinutes;
    const regularMinutes = Math.max(0, (staff.shiftEndMinutes || 17 * 60) - (staff.shiftStartMinutes || 9 * 60));
    const otMinutes = Math.max(0, workedMinutes - regularMinutes);
    todayRecord.otMinutes = otMinutes;
    staff.otHours = (staff.otHours || 0) + otMinutes / 60;
    await staff.save();
    res.json({ message: 'Checked out', attendance: todayRecord, aggregateOtHours: staff.otHours });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Generate Staff Report
export const generateReport = async (req, res) => {
  try {
    const staff = await Staff.find();
    const report = staff.map((s) => ({
      name: s.name,
      role: s.role,
      bus: s.assignedBus || "Not assigned",
      totalAttendance: s.attendance ? s.attendance.length : 0,
      salary: s.salary || 0,
    }));
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff names and basic salaries for advance requests
// @route   GET /api/staff/names-and-salaries
// @access  Private (e.g., Admin/HR access)
export const getStaffForAdvance = async (req, res) => {
  try {
    const staffData = await Staff.find({}, 'name basicSalary').lean(); // Lean to get plain JS objects
    
    // Rename _id to id for consistency if needed, but we'll use _id
    const responseData = staffData.map(staff => ({
        _id: staff._id,
        name: staff.name,
        basicSalary: staff.basicSalary || 0,
    })).filter(staff => staff.name);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching staff for advance:", error);
    res.status(500).json({ message: "Server error fetching staff data." });
  }
};

