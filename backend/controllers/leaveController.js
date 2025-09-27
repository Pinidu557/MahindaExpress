import Leave from '../models/leaveModel.js';

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const leave = new Leave({ employee_id, leave_type, start_date, end_date, reason });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve/Reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id, status, approver_id } = req.body;
    if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    const update = { status };
    if (approver_id && status !== 'pending') {
      update.approver_id = approver_id;
      update.approval_date = new Date();
    }
    const leave = await Leave.findByIdAndUpdate(id, update, { new: true });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Leave history for an employee or date range
export const getLeaveHistory = async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;
    const query = {};
    if (employee_id) query.employee_id = employee_id;
    if (start_date || end_date) {
      query.start_date = {};
      if (start_date) query.start_date.$gte = new Date(start_date);
      if (end_date) query.start_date.$lte = new Date(end_date);
    }
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Pending leaves for approval
export const getPendingLeaves = async (_req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


