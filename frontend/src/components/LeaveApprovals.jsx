import React, { useState, useEffect } from 'react';
import { getPendingLeaves, updateLeaveStatus } from '../lib/api';

const LeaveApprovals = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const approverId = '456'; // Replace with actual approver ID from context/auth

    useEffect(() => {
        loadPendingLeaves();
    }, []);

    const loadPendingLeaves = async () => {
        try {
            const data = await getPendingLeaves();
            setLeaves(data);
        } catch (err) {
            setError('Failed to load pending leaves');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leaveId) => {
        try {
            await updateLeaveStatus(leaveId, 'approved', approverId);
            await loadPendingLeaves();
        } catch (err) {
            setError('Failed to approve leave');
        }
    };

    const handleReject = async (leaveId) => {
        try {
            await updateLeaveStatus(leaveId, 'rejected', approverId);
            await loadPendingLeaves();
        } catch (err) {
            setError('Failed to reject leave');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Pending Leave Approvals</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {leaves.length === 0 ? (
                <p className="text-gray-500">No pending leave requests</p>
            ) : (
                <div className="grid gap-4">
                    {leaves.map((leave) => (
                        <div key={leave._id} className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">
                                        {leave.employee_id.name} - {leave.leave_type}
                                    </h3>
                                    <p className="text-gray-600">
                                        {new Date(leave.start_date).toLocaleDateString()} to{' '}
                                        {new Date(leave.end_date).toLocaleDateString()}
                                    </p>
                                    <p className="mt-2">{leave.reason}</p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleApprove(leave._id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(leave._id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaveApprovals;
