import React, { useState } from 'react';

const PayrollReport = ({ employeeId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generatePayrollPDF = async (month) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `http://localhost:4000/reports/payroll?employee_id=${employeeId}&month=${month}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate payroll report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll_${month}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to get the last month in YYYY-MM format
    const getLastMonth = () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    return (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          
        </div>
    );
};

export default PayrollReport;
