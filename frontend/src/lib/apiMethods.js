// Auth and user management
export const loginStaff = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const registerStaff = async (staffData) => {
    const response = await api.post('/staff/register', staffData);
    return response.data;
};

// Attendance management
export const checkIn = async (employeeId) => {
    const response = await api.post('/attendance/check-in', { employee_id: employeeId });
    return response.data;
};

export const checkOut = async (employeeId) => {
    const response = await api.post('/attendance/check-out', { employee_id: employeeId });
    return response.data;
};

export const getAttendanceHistory = async (employeeId, startDate, endDate) => {
    const response = await api.get('/attendance/history', {
        params: { employee_id: employeeId, start_date: startDate, end_date: endDate }
    });
    return response.data;
};

export const getTodayAttendance = async () => {
    const response = await api.get('/attendance/today');
    return response.data;
};

// Leave management
export const applyLeave = async (leaveData) => {
    const response = await api.post('/leave/apply', leaveData);
    return response.data;
};

export const updateLeaveStatus = async (leaveId, status, approverId) => {
    const response = await api.put('/leave/status', {
        leave_id: leaveId,
        status,
        approver_id: approverId
    });
    return response.data;
};

export const getLeaveHistory = async (employeeId, status) => {
    const response = await api.get('/leave/history', {
        params: { employee_id: employeeId, status }
    });
    return response.data;
};

export const getPendingLeaves = async () => {
    const response = await api.get('/leave/pending');
    return response.data;
};

// Payroll management
export const generatePayroll = async (employeeId, month) => {
    const response = await api.post('/payroll/generate', {
        employee_id: employeeId,
        month
    });
    return response.data;
};

export const getPayrollHistory = async (employeeId, year) => {
    const response = await api.get('/payroll/history', {
        params: { employee_id: employeeId, year }
    });
    return response.data;
};

export const approvePayroll = async (payrollId) => {
    const response = await api.put('/payroll/approve', {
        payroll_id: payrollId
    });
    return response.data;
};

export const markPayrollAsPaid = async (payrollId) => {
    const response = await api.put('/payroll/mark-paid', {
        payroll_id: payrollId
    });
    return response.data;
};
