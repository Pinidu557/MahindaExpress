//import React, { useState, useEffect } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import DatePicker from '../components/DatePicker'; // Assuming you have this component for month/year selection
import { getInitialValidDate, formatMonthYear } from '../utils/dateUtils'; // Assuming these utility functions exist
import { FiDownload, FiTrash2, FiEdit } from 'react-icons/fi';
import { TbMailForward } from 'react-icons/tb';
import { generateSalaryPDF } from '../utils/pdfGenerator'; 
import { generatePayrollReport } from '../utils/generatePayrollReport';

const API_BASE_URL = 'http://localhost:4000/api/salaries'; 

const formatLKR = (amount) => (amount || 0).toFixed(2);

// Helper function to safely get a value from the record for sorting
// Handles nested 'staff' fields vs. top-level salary fields
const getSortValue = (record, key) => {
    // Keys that refer to the nested staff object
    if (key === 'name' || key === 'designation' || key === 'email') {
        // designation is 'role' in your staff object
        const staffKey = key === 'designation' ? 'role' : key;
        return record.staff?.[staffKey] || ''; 
    }
    
    // Keys that refer to the top-level salary record fields
    return record[key] || 0; 
};

const PayRollPageFinance = () => {
    const [selectedDate, setSelectedDate] = useState(getInitialValidDate());
    const [payrollData, setPayrollData] = useState([]);
    const [totals, setTotals] = useState({ totalGross: '0.00', totalDeductions: '0.00', totalNetPay: '0.00' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    // Combined sort state to manage which column is being sorted and its direction
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const navigate = useNavigate();

    const handleExportReport = () => {
    // 1. Ensure selectedDate is a native Date object for the report function
    // Convert the moment/string stored in state to a JavaScript Date object
    const dateForReport = moment(selectedDate).toDate(); // <--- THE FIX

    // 2. Determine the current sort information for the report header
    const currentSort = `Sort By: ${sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)} (${sortConfig.direction.toUpperCase()})`;

    // 3. Call the utility function with all necessary data
    generatePayrollReport(
        sortedAndFilteredData,
        totals,
        dateForReport, // <--- Pass the new Date object
        currentSort,
        searchTerm
    );
};

    // New function to toggle the direction of the current sort key
const toggleSortDirection = () => {
    // Only toggle if a key is currently set
    if (sortConfig.key) {
        setSortConfig(prevConfig => ({
            ...prevConfig, // Keep the current key
            direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' // Toggle direction
        }));
    } else {
        // If no key is set (initial state), set a default sort, e.g., by name ascending
        setSortConfig({ key: 'name', direction: 'asc' });
    }
};

    const fetchPayrollData = async (date) => {
        setLoading(true);
        const monthYear = formatMonthYear(date);
        try {
            const response = await axios.get(API_BASE_URL, {
                params: { monthYear }
            });
            setPayrollData(response.data.payrollData);
            setTotals(response.data.totals);
        } catch (error) {
            console.error('Error fetching payroll data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrollData(selectedDate);
    }, [selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    
    // Function to handle sorting
    // const handleSort = (key) => {
    //     if (sortKey === key) {
    //         setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    //     } else {
    //         setSortKey(key);
    //         setSortDirection('asc');
    //     }
    // };
    
    // // Sort and filter the data for display
    // const sortedAndFilteredData = payrollData
    //     .filter(record => 
    //         record.staff && 
    //         (record.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    //          record.staff.email.toLowerCase().includes(searchTerm.toLowerCase()))
    //     )
    //     .sort((a, b) => {
    //         const aValue = a.staff[sortKey] || a[sortKey] || '';
    //         const bValue = b.staff[sortKey] || b[sortKey] || '';

    //         if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    //         if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    //         return 0;
    //     });

    const sortedAndFilteredData = useMemo(() => {
    let filtered = payrollData;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    if (lowerCaseSearchTerm) {
        filtered = filtered.filter(record => {
            const staff = record.staff || {};
            
            // --- Global Search Logic ---
            // 1. Check Staff Details (Name, Role, Email)
            const staffMatch = 
                (staff.name && staff.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (staff.role && staff.role.toLowerCase().includes(lowerCaseSearchTerm)) || // Check Designation/Role
                (staff.email && staff.email.toLowerCase().includes(lowerCaseSearchTerm));

            // 2. Check Salary Details and Status (Converting numbers to strings for search)
            const salaryMatch =
                (record.status && record.status.toLowerCase().includes(lowerCaseSearchTerm)) || // Check Status
                (record.basicSalary && String(record.basicSalary).includes(lowerCaseSearchTerm)) ||
                (record.grossSalary && String(record.grossSalary).includes(lowerCaseSearchTerm)) ||
                (record.totalDeductions && String(record.totalDeductions).includes(lowerCaseSearchTerm)) ||
                (record.netSalary && String(record.netSalary).includes(lowerCaseSearchTerm));

            // Return true if any field matches the search term
            return staffMatch || salaryMatch;
        });
    }

    // --- Apply Sorting to the Filtered Data (This part remains the same) ---
    if (!sortConfig.key) {
        return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction;
        
        // Use the getSortValue helper here to pull the correct data
        const getSortValue = (r, k) => {
            if (k === 'name' || k === 'designation' || k === 'email') {
                const staffKey = k === 'designation' ? 'role' : k;
                return r.staff?.[staffKey] || ''; 
            }
            // For salary fields, use a safer check, as they might be undefined
            const salaryKeys = ['basicSalary', 'grossSalary', 'totalDeductions', 'netSalary'];
            if (salaryKeys.includes(k)) {
                return r[k] !== undefined ? r[k] : 0;
            }
            return r[k] || ''; // Fallback for 'status'
        };


        // A. Status Sort
        if (key === 'status') {
            const statusOrder = { 'Pending': 1, 'Calculated': 2, 'Paid': 3 };
            const aStatus = statusOrder[a.status || 'Pending'] || 4;
            const bStatus = statusOrder[b.status || 'Pending'] || 4;
            return direction === 'asc' ? aStatus - bStatus : bStatus - aStatus;
        }

        // B. Numeric Sort
        if (['basicSalary', 'grossSalary', 'totalDeductions', 'netSalary'].includes(key)) {
            const aValue = getSortValue(a, key);
            const bValue = getSortValue(b, key);
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // C. Alphabetic Sort (Name, Designation, Email)
        const aValue = String(getSortValue(a, key)).toLowerCase();
        const bValue = String(getSortValue(b, key)).toLowerCase();

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
}, [payrollData, searchTerm, sortConfig]); // Dependencies remain the same

      

    const handleCalculate = (staffId, initialData) => {
        const monthYear = formatMonthYear(selectedDate);
        const staffDetails = initialData.staff || {};
        navigate('/salary-form', { 
            state: { 
                staffId, 
                monthYear, 
                staffName: staffDetails.name || initialData.name || 'N/A', 
            staffRole: staffDetails.role || initialData.role || 'N/A', 
            staffEmail: staffDetails.email || initialData.email || 'N/A',       // The staff's email
                
                // Pass initial data derived from Staff model and attendance processing
                basicSalary: initialData.basicSalary,
                otHours: initialData.otHours,
                noPayDays: initialData.noPayDays,
                loan: initialData.loan, 
                allowances: initialData.allowances, 
                bonus: initialData.bonus,
                reimbursements: initialData.reimbursements,
                isNew: true
            } 
        });
    };

    // const handleUpdate = (salaryId) => {
    //     // Navigates to the update route, data will be fetched inside SalaryForm
    //     navigate(`/salary-form/${salaryId}`);
    // };

    const handleUpdate = (salaryId, staffId, initialData) => {
    const monthYear = formatMonthYear(selectedDate);
    const staffDetails = initialData.staff || initialData;

    // We pass the salaryId for the form to know it's an update 
    // but pass the initial data from the Staff Model for fresh form population.
    navigate(`/salary-form/${salaryId}`, { 
        state: {
            salaryId, // Important: Pass the existing salary ID
            staffId,
            monthYear,
            staffName: staffDetails.name || initialData.name || 'N/A',
            staffRole: staffDetails.role || initialData.role || 'N/A',
            staffEmail: staffDetails.email || initialData.email || 'N/A',
            
            // Pass initial/staff model data
            basicSalary: initialData.basicSalary,
            otHours: initialData.otHours, // Assuming attendance data is up-to-date in 'record'
            noPayDays: initialData.noPayDays, // Assuming attendance data is up-to-date in 'record'
            loan: initialData.loan, 
            allowances: initialData.allowances, 
            bonus: initialData.bonus,
            reimbursements: initialData.reimbursements,
            isNew: false // Flag for update
        }
    });
};

    const handleViewSalarySlip = (salary) => {
        navigate('/salary-slip-view', { state: { salary } });
    };

    /*const handleSendEmail = async (salaryId) => {
        if (window.confirm("Are you sure you want to send the salary slip via email? This will update the status to 'Paid'.")) {
            try {
                await axios.post(`${API_BASE_URL}/send-slip/${salaryId}`);
                alert('Salary slip sent and status updated to Paid!');
                fetchPayrollData(selectedDate);
            } catch (error) {
                console.error('Error sending email:', error);
                alert('Failed to send email. Check console or backend logs.');
            }
        }
    };*/

//     const handleSendEmail = async (salary) => {
//     const salaryId = salary._id;
//     const recipientEmail = salary.staff.email; 
    
//     if (!salaryId || !recipientEmail) {
//         alert('Cannot send email: Salary ID or staff email missing.');
//         return;
//     }
    
//     if (window.confirm(`Are you sure you want to send the salary slip to ${recipientEmail}? This will update the status to 'Paid'.`)) {
        
//         // 1. Generate the PDF data as Base64
//         const pdfData = generateSalaryPDF(salary, false); // Pass 'false' to return Base64
        
//         if (!pdfData || !pdfData.base64) {
//             alert('Failed to generate PDF attachment for email.');
//             return;
//         }

//         try {
//             // 2. Send the Base64 data to the server
//             const payload = {
//                 recipient: recipientEmail,
//                 pdfBase64: pdfData.base64,
//                 filename: pdfData.filename,
//             };

//             // Use the existing route, but send the data
//             await axios.post(`${API_BASE_URL}/send-slip/${salaryId}`, payload);
            
//             // 3. Success Feedback
//             alert(`Salary slip sent successfully to ${recipientEmail} and status updated to Paid!`);
//             fetchPayrollData(selectedDate); // Refresh the table
            
//         } catch (error) {
//             console.error('Error sending email:', error.response?.data || error.message);
//             alert('Failed to send email. Check console for details.');
//         }
//     }
// };

const handleSendEmail = async (salary) => {
    const salaryId = salary._id;
    const recipientEmail = salary.staff.email; 
    
    if (!salaryId || !recipientEmail) {
        alert('Cannot send email: Salary ID or staff email missing.');
        return;
    }
    
    if (window.confirm(`Are you sure you want to send the salary slip to ${recipientEmail}? This will update the status to 'Paid'.`)) {
        try {
            // 1. Send an empty POST request to the server with the Salary ID
            // The server will handle all PDF generation, emailing, and status updates.
            // The route is mapped in your server to /api/salaries/send-slip/:id
            await axios.post(`${API_BASE_URL}/send-slip/${salaryId}`); 
            
            // 2. Success Feedback
            alert(`Salary slip sent successfully to ${recipientEmail} and status updated to Paid!`);
            fetchPayrollData(selectedDate); // Refresh the table
            
        } catch (error) {
            console.error('Error sending email:', error.response?.data || error.message);
            alert('Failed to send email. Check console for details.');
        }
    }
};

    // const handleDownloadSlip = async (salaryId, staffName, monthYear) => {
    //     try {
    //         const response = await axios.get(`${API_BASE_URL}/download-slip/${salaryId}`, {
    //             responseType: 'blob',
    //         });

    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', `${staffName.replace(/\s/g, '_')}_${monthYear.replace(/\s/g, '-')}_Slip.pdf`);
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //         window.URL.revokeObjectURL(url);
    //     } catch (error) {
    //         console.error('Error downloading slip:', error);
    //         alert('Failed to download salary slip.');
    //     }
    // };

    const handleDownloadSlip = (salary) => {
    // salary is the full record object (which includes staff info, monthYear, and calculated values)
    generateSalaryPDF(salary); 
};

    /*const handleDownloadSlip = async (salaryId, staffName, monthYear) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/download-slip/${salaryId}`, {
            responseType: 'blob',
            // It's good practice to send authentication tokens here if required
            // headers: { 'Authorization': `Bearer ${yourAuthToken}` } 
        });

        // 1. Success: Server returned the PDF as a blob
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        // Use the filename construction you already have
        link.setAttribute('download', `${staffName.replace(/\s/g, '_')}_${monthYear.replace(/\s/g, '-')}_Slip.pdf`);
        
        // This is necessary for Firefox
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error downloading slip:', error);

        // --- Critical Error Handling Logic ---
        if (error.response && error.response.data instanceof Blob) {
            // 2. Failure: Server returned an error (e.g., 401, 500) but the responseType was set to 'blob'.
            // We need to read the blob data as text to get the actual JSON error message.
            
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    const errorJson = JSON.parse(reader.result);
                    // Display the actual error message from the server
                    alert(`Download failed: ${errorJson.message || 'An unexpected server error occurred.'}`);
                } catch (e) {
                    // If parsing as JSON fails (e.g., it's plain text or HTML error)
                    alert('Failed to download slip. Server returned an unreadable error.');
                }
            };
            // Start reading the error blob as text
            reader.readAsText(error.response.data);
        } else if (error.message) {
            // Network error (CORS, offline, timeout)
            alert(`Failed to download salary slip: ${error.message}`);
        } else {
            // Generic fallback
            alert('Failed to download salary slip. Please check your network connection.');
        }
    }
};*/

    const handleDelete = async (salaryId) => {
        if (window.confirm("Are you sure you want to DELETE this salary record? This cannot be undone.")) {
            try {
                await axios.delete(`${API_BASE_URL}/${salaryId}`);
                alert('Salary record deleted.');
                fetchPayrollData(selectedDate);
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Failed to delete salary record.');
            }
        }
    };


    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-green-400 flex items-center">
                    <span className="mr-3 text-4xl">💼</span> Employee Payroll Manager
                </h1>
                <p className="text-gray-400">Track and manage employee compensation for the selected month.</p>
            </header>

            {/* Function Bar - Updated Layout */}
            <div className="bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex justify-between items-center border border-blue-900/50">
 <div className="flex justify-between items-center w-full">
    {/* Left Side: Search, Filters, Sort */}
    <div className="flex items-center space-x-3">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 p-2.5 pl-10 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>
      {/* <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2.5 rounded-lg text-sm flex items-center">
        <span className="mr-1">🎚️</span> Filters
      </button> */}
      {/* <button
        onClick={() => handleSort(sortConfig.key)}
        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2.5 rounded-lg text-sm flex items-center"
      >
        <span className="mr-1">⇅</span> Sort
      </button> */}
      {/* Sort Dropdown */}
                        <select
                            value={sortConfig.key}
                            onChange={(e) => setSortConfig({ key: e.target.value, direction: 'asc' })}
                            className="bg-gray-800 border border-gray-700 p-2.5 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="name">Sort By Name</option>
                            <option value="designation">Sort By Designation</option>
                            <option value="basicSalary">Sort By Basic Salary</option>
                            <option value="grossSalary">Sort By Gross Salary</option>
                            <option value="totalDeductions">Sort By Deductions</option>
                            <option value="netSalary">Sort By Net Salary</option>
                            <option value="status">Sort By Status</option>
                        </select>

                        {/* Sort Direction Button (Using handleSort to toggle direction for the selected key) */}
                        <button
                            onClick={toggleSortDirection}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2.5 rounded-lg text-sm flex items-center min-w-[80px] justify-center"
                        >
                            {/* Display correct arrow based on direction */}
                            <span className="mr-1">
                                {sortConfig.direction === 'asc' ? '▲' : '▼'}
                            </span> 
                            {sortConfig.direction.toUpperCase()}
                        </button>
                    </div>
    

    {/* Right Side: Date Picker, Export */}
    <div className="flex items-center space-x-3">
      <DatePicker selectedDate={selectedDate} onChange={handleDateChange} />
      <button 
          onClick={handleExportReport} // <-- Use the new handler here
          className="bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-lg font-semibold text-sm"
      >
        <span className="mr-1">📤</span> Export
      </button>
    
    </div>
  </div>
</div>



            {/* Totals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-green-500">
                    <p className="text-gray-400 flex items-center"><span className="mr-2 text-green-500">$</span>Total Gross Salary</p>
                    <h2 className="text-3xl font-bold text-white mt-1">LKR {totals.totalGross}</h2>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-red-500">
                    <p className="text-gray-400 flex items-center"><span className="mr-2 text-red-500">⊖</span>Total Deductions</p>
                    <h2 className="text-3xl font-bold text-white mt-1">LKR {totals.totalDeductions}</h2>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-blue-500">
                    <p className="text-gray-400 flex items-center"><span className="mr-2 text-blue-500">💰</span>Total Net Pay</p>
                    <h2 className="text-3xl font-bold text-white mt-1">LKR {totals.totalNetPay}</h2>
                </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-gray-300">
                Records for {formatMonthYear(selectedDate)} ({sortedAndFilteredData.length} of {payrollData.length} Staff Shown)
            </h3>

            {/* Employee Table */}
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-2xl">
                {loading ? (
                    <div className="text-center p-10 text-gray-400">Loading payroll data...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                {['STAFF NAME', 'DESIGNATION', 'EMAIL', 'BASIC SALARY (LKR)', 'GROSS SALARY (LKR)', 'DEDUCTIONS (LKR)', 'NET SALARY (LKR)', 'STATUS', 'SLIP', 'ACTION'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {sortedAndFilteredData.map((record) => {
                                const staff = record.staff || {};
                                const salary = record._id ? record : {}; // salary._id is the salary document ID if it exists
                                
                                let statusColor = 'text-yellow-500';
                                if (salary.status === 'Calculated') statusColor = 'text-blue-400';
                                if (salary.status === 'Paid') statusColor = 'text-green-500';

                                // Data to pass to handleCalculate for Pending records
                                const initialCalculationData = {
                                    basicSalary: record.basicSalary || staff.basicSalary,
                                    otHours: record.otHours,
                                    noPayDays: record.noPayDays,
                                    loan: record.loan || staff.loan,
                                    allowances: record.allowances || staff.allowances,
                                    bonus: record.bonus || staff.bonus,
                                    reimbursements: record.reimbursements || staff.reimbursements
                                };

                                return (
                                    <tr key={staff._id || staff.email} className="hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{staff.name}</td>
                                        {/* New Designation Column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-400 font-medium">{staff.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{staff.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatLKR(salary.basicSalary)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{salary.grossSalary ? formatLKR(salary.grossSalary) : '0.00'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{salary.totalDeductions ? formatLKR(salary.totalDeductions) : '0.00'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">{salary.netSalary ? formatLKR(salary.netSalary) : '0.00'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${statusColor}`}>{salary.status || 'Pending'}</td>
                                        
                                        {/* Salary Slip View/Download Column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {salary._id && ( // ONLY show slip actions if a salary record exists
                                                <div className="flex items-center space-x-2">
                                                    <button 
                                                        onClick={() => handleViewSalarySlip(salary)}
                                                        className="text-blue-400 hover:text-blue-300 underline text-xs"
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        //onClick={() => handleDownloadSlip(salary._id, staff.name, salary.monthYear)}
                                                        onClick={() => handleDownloadSlip(salary)}
                                                        className="text-white hover:text-gray-300"
                                                        title="Download Slip"
                                                    >
                                                        <FiDownload className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* Action Buttons - Conditional Logic */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {!salary._id ? ( // Show Calculate button if NO salary record exists for the month
                                                <button
                                                    onClick={() => handleCalculate(staff._id, initialCalculationData)}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                                                >
                                                    Calculate
                                                </button>
                                            ) : ( // Show Update/Delete/Send Email if a salary record EXISTS
                                                <div className="flex space-x-2">
                                                    {/* {salary.status === 'Calculated' && (
                                                        <button
                                                            //onClick={() => handleSendEmail(salary._id)}
                                                            onClick={() => handleSendEmail(record)}
                                                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                                                            title="Send Email"
                                                        >
                                                            <TbMailForward className="w-4 h-4" />
                                                        </button>
                                                    )} */}
                                                    {/* <button
                                                        onClick={() => handleUpdate(salary._id)}
                                                        className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                                                        title="Update Calculation"
                                                    > */}
                                                    <button
                onClick={() => handleUpdate(salary._id, staff._id, initialCalculationData)} // *** MODIFIED HERE ***
                className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                title="Update Calculation"
            >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(salary._id)}
                                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                                        title="Delete Record"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PayRollPageFinance;