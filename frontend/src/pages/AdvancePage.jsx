import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment'; 
import { generateAdvanceReport } from '../utils/generateAdvanceReport.js';
import { ChevronDown, Pencil, Trash2, Search, Filter, SortAsc, Upload, Plus, X } from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:4000'; // <--- ADJUST THIS IF YOUR BACKEND PORT IS DIFFERENT

// --- UTILITY FUNCTIONS ---

const generateDeductionMonths = () => {
    const today = new Date();
    const months = [];

    for (let i = 0; i < 3; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        // Value format: YYYY-MM (e.g., 2023-11)
        const monthValue = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
        months.push({ value: `${year}-${monthValue}`, label: `${monthName} ${year}` });
    }
    return months;
};

// ==============================================================================
// 1. ACTION BUTTONS COMPONENT (MOVED OUTSIDE FOR PERFORMANCE FIX)
// ==============================================================================
const ActionButtons = ({ searchTerm, setSearchTerm, sortConfig, handleSort }) => {
    return (
        <div className="bg-gray-800 rounded-xl p-4 shadow-md mb-6 flex flex-col md:flex-row gap-3 items-center">
            {/* Search Input - Now stable due to component isolation */}
            <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search by name, reason, amount, date..." 
                    className="w-full py-2 pl-10 pr-4 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-gray-500"
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Simple Sort Display */}
            <div className="relative w-full md:w-auto">
                <button 
                    onClick={() => handleSort(sortConfig.key)} 
                    className="flex items-center justify-center w-full md:w-auto px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-900 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-700 transition duration-150"
                    title={`Currently sorting by ${sortConfig.key}. Click to toggle direction.`}
                >
                    <SortAsc className={`mr-2 w-4 h-4 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                    Sort: {sortConfig.key.toUpperCase()}
                </button>
            </div>
            
            {/* Filter button replaced by "Clear Search" button - NOW FUNCTIONAL */}
            <button 
                onClick={() => setSearchTerm('')} 
                className="flex items-center justify-center w-full md:w-auto px-4 py-2 text-sm font-semibold text-red-300 bg-gray-900 border border-gray-600 rounded-lg shadow-sm hover:bg-red-800/50 transition duration-150 disabled:opacity-50"
                disabled={!searchTerm}
                title="Clear the current search term."
            >
                <X className="mr-2 w-4 h-4" />Clear Search
            </button>
        </div>
    );
};

// ==============================================================================
// 2. CORE COMPONENT: AdvancePage
// ==============================================================================

const AdvancePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [advanceHistory, setAdvanceHistory] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const [filteredNames, setFilteredNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- SEARCH AND SORT STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'processedDate', direction: 'desc' }); 
    
    const [formData, setFormData] = useState({
        employeeId: '',
        nameInput: '',
        basicSalary: 0,
        advanceAmount: '',
        reason: 'Select Reason',
        deductionMonth: generateDeductionMonths()[0]?.value || '',
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);

    const deductionMonths = useMemo(() => generateDeductionMonths(), []);
    const maxAdvanceAmount = formData.basicSalary / 2;

    // --- API & INITIAL DATA FETCHING (Unchanged) ---
    const fetchAdvanceHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const advancesRes = await axios.get(`${API_BASE_URL}/api/advances`);
            setAdvanceHistory(advancesRes.data);
        } catch (err) {
            console.error("Error fetching advance history:", err);
            setError('Failed to fetch advance history.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStaffData = useCallback(async () => {
        try {
            const staffRes = await axios.get(`${API_BASE_URL}/staff`);
            const projectedData = staffRes.data.map(emp => ({
                _id: emp._id,
                name: emp.name,
                basicSalary: emp.basicSalary || 0,
            })).filter(emp => emp.name);
            setEmployees(projectedData);
        } catch (err) {
            console.error("Error fetching staff data:", err);
        }
    }, []);

    useEffect(() => {
        fetchAdvanceHistory();
        fetchStaffData();
    }, [fetchAdvanceHistory, fetchStaffData]);


    // --- Employee Search/Autofill Logic (Unchanged) ---
    useEffect(() => {
        if (formData.nameInput.length > 1) {
            const results = employees.filter(emp =>
                emp.name.toLowerCase().startsWith(formData.nameInput.toLowerCase())
            );
            setFilteredNames(results);
        } else {
            setFilteredNames([]);
        }
    }, [formData.nameInput, employees]);

    // --- Validation Logic (Unchanged) ---
    const validateAdvanceAmount = (amount, basicSalary) => {
        const numAmount = parseFloat(amount);
        const maxAdvance = basicSalary / 2;

        if (numAmount <= 0 || isNaN(numAmount)) {
            return "Amount must be greater than LKR 0 (amount > 0).";
        }
        if (numAmount > maxAdvance) {
            const maxDisplay = maxAdvance.toLocaleString('en-US', { minimumFractionDigits: 2 });
            return `Amount should be less than or equal to LKR ${maxDisplay} (50% of Basic Salary).`;
        }
        return null;
    };

    // --- Handlers (Unchanged) ---
    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            employeeId: '',
            nameInput: '',
            basicSalary: 0,
            advanceAmount: '',
            reason: 'Select Reason',
            deductionMonth: deductionMonths[0]?.value || '',
        });
        setValidationErrors({});
    };
    
    const handleNameSelect = (employee) => {
        setFormData(prev => ({
            ...prev,
            employeeId: employee._id,
            nameInput: employee.name,
            basicSalary: employee.basicSalary || 0,
        }));
        setFilteredNames([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'advanceAmount') {
            const basicSalary = formData.basicSalary;
            const error = validateAdvanceAmount(value, basicSalary);
            setValidationErrors(prev => ({ ...prev, advanceAmount: error }));
        }
    };

    const handleExportPDF = () => {
    // Construct a human-readable sort string
    const sortDescription = `Sort By ${sortConfig.key.toUpperCase()}, ${sortConfig.direction.toUpperCase()}`;

    generateAdvanceReport(
        sortedAndFilteredAdvanceData, // The data to display
        advanceTotals,               // The calculated summary totals
        sortDescription,             // The current sort configuration
        searchTerm                   // The current search term
    );
};
    const handleSubmitAdvance = async (e) => {
        e.preventDefault();

        if (!formData.employeeId) {
            setValidationErrors(prev => ({ ...prev, form: 'Please select an employee from the search results.' }));
            return;
        }

        const finalError = validateAdvanceAmount(formData.advanceAmount, formData.basicSalary);
        if (finalError || formData.reason === 'Select Reason') {
            setValidationErrors(prev => ({
                ...prev,
                advanceAmount: finalError || prev.advanceAmount,
                form: (!formData.employeeId || formData.reason === 'Select Reason') ? 'Please ensure all fields are filled correctly.' : null
            }));
            return;
        }

        const payload = {
            staffId: formData.employeeId,
            advanceAmount: parseFloat(formData.advanceAmount),
            reason: formData.reason,
            deductionMonth: formData.deductionMonth,
        };

        setLoading(true);
        try {
            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/api/advances/${currentEditId}`, payload); 
            } else {
                await axios.post(`${API_BASE_URL}/api/advances`, payload); 
            }
            
            await fetchAdvanceHistory();
            closeModal();
            
        } catch (err) {
            console.error('Submission failed:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this advance record? This cannot be undone.")) return;

        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/advances/${id}`);
            await fetchAdvanceHistory();
        } catch (err) {
            console.error('Deletion failed:', err.response?.data?.message || err.message);
            setError('Deletion failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setFormData({
            employeeId: record.staffId,
            nameInput: record.staffName,
            basicSalary: record.basicSalarySnapshot || 0,
            advanceAmount: record.advanceAmount.toString(),
            reason: record.reason,
            deductionMonth: record.deductionMonth,
        });
        setCurrentEditId(record._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const openModal = () => {
        setIsEditMode(false);
        setCurrentEditId(null);
        setFormData({
            employeeId: '',
            nameInput: '',
            basicSalary: 0,
            advanceAmount: '',
            reason: 'Select Reason',
            deductionMonth: deductionMonths[0]?.value || '',
        });
        setValidationErrors({});
        setIsModalOpen(true);
    };

    // --- SORT HANDLER (Unchanged) ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- SEARCH AND SORT MEMOIZATION (Unchanged) ---
    const sortedAndFilteredAdvanceData = useMemo(() => {
        let filtered = advanceHistory;
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        // 1. --- Filtering / Searching Logic ---
        if (lowerCaseSearchTerm) {
            filtered = filtered.filter(record => {
                const amountMatch = String(record.advanceAmount || '').includes(lowerCaseSearchTerm);
                const basicMatch = String(record.basicSalarySnapshot || '').includes(lowerCaseSearchTerm);
                const nameMatch = (record.staffName || '').toLowerCase().includes(lowerCaseSearchTerm);
                const reasonMatch = (record.reason || '').toLowerCase().includes(lowerCaseSearchTerm);
                const monthMatch = (record.deductionMonth || '').toLowerCase().includes(lowerCaseSearchTerm);
                const statusMatch = (record.status || '').toLowerCase().includes(lowerCaseSearchTerm);
                const processedDateStr = record.processedDate ? moment(record.processedDate).format('YYYY-MM-DD') : '';
                const dateMatch = processedDateStr.includes(lowerCaseSearchTerm);

                return nameMatch || reasonMatch || monthMatch || statusMatch || amountMatch || basicMatch || dateMatch;
            });
        }

        // 2. --- Sorting Logic ---
        if (!sortConfig.key) {
            return filtered;
        }

        const sorted = [...filtered].sort((a, b) => {
            const key = sortConfig.key;
            const direction = sortConfig.direction;
            
            let aValue;
            let bValue;

            if (['advanceAmount', 'basicSalarySnapshot'].includes(key)) {
                aValue = a[key] || 0;
                bValue = b[key] || 0;
            } 
            else if (key === 'processedDate' || key === 'deductionMonth') {
                aValue = a[key] || '';
                bValue = b[key] || '';
            } 
            else { 
                aValue = String(a[key] || '').toLowerCase();
                bValue = String(b[key] || '').toLowerCase();
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [advanceHistory, searchTerm, sortConfig]);


    const advanceTotals = useMemo(() => {
    const totalAdvanceAmount = sortedAndFilteredAdvanceData.reduce((sum, record) => {
        return sum + (record.advanceAmount || 0);
    }, 0);

    return { 
        totalAdvanceAmount: totalAdvanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) 
    };
}, [sortedAndFilteredAdvanceData]);
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* --- HEADER BAR (Unchanged) --- */}
                <header className="bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex justify-between items-center border border-blue-900/50">
                    <h1 className="text-xl font-bold text-white">Salary Advance Management</h1>
                    <div className="flex items-center space-x-3">
                        <button onClick={handleExportPDF} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-600 transition duration-150">
                            <Upload className="mr-2 w-4 h-4" />Export
                        </button>
                        <button onClick={openModal} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition duration-150">
                            <Plus className="mr-2 w-4 h-4" />Add Advance
                        </button>
                    </div>
                </header>

                {/* --- SEARCH & FILTER BAR - NOW PASSING PROPS TO THE EXTERNAL COMPONENT --- */}
                <ActionButtons 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                />

                {/* --- LOADING/ERROR FEEDBACK (Unchanged) --- */}
                {loading && <div className="text-center py-4 text-blue-400">Loading data...</div>}
                {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}
                
                {(!loading && !error && advanceHistory.length > 0 && sortedAndFilteredAdvanceData.length === 0) && (
                    <div className="text-center py-4 text-yellow-500">No results found for **'{searchTerm}'**.</div>
                )}

                {/* --- MAIN ADVANCE HISTORY TABLE (Unchanged) --- */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-blue-900/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Advance History</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    {[{label: 'NAME', key: 'staffName'}, {label: 'BASIC SALARY (LKR)', key: 'basicSalarySnapshot'}, 
                                      {label: 'ADVANCE AMOUNT (LKR)', key: 'advanceAmount'}, {label: 'PROCESSED DATE', key: 'processedDate'}, 
                                      {label: 'DEDUCTION MONTH', key: 'deductionMonth'}, {label: 'STATUS', key: 'status'}, 
                                      {label: 'RECORD ACTION', key: 'actions', sortable: false}].map(header => (
                                        <th 
                                            key={header.key} 
                                            scope="col" 
                                            className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${header.sortable !== false ? 'cursor-pointer hover:text-white transition duration-150' : ''}`}
                                            onClick={header.sortable !== false ? () => handleSort(header.key) : undefined}
                                        >
                                            {header.label}
                                            {sortConfig.key === header.key && (
                                                <SortAsc className={`inline ml-1 w-3 h-3 transition duration-200 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {sortedAndFilteredAdvanceData.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {advanceHistory.length === 0 ? "No advance requests found. Click 'Add Advance' to create one." : "No records match the current search criteria."}
                                        </td>
                                    </tr>
                                ) : (
                                    sortedAndFilteredAdvanceData.map(record => ( 
                                        <tr key={record._id} className="hover:bg-gray-700 transition duration-100">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{record.staffName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{`LKR ${record.basicSalarySnapshot?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || 'N/A'}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{`LKR ${record.advanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {record.processedDate ? new Date(record.processedDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-400 font-medium">{record.deductionMonth}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        record.status === 'Active' ? 'bg-green-700 text-green-300' :
                                                        record.status === 'Deducted' ? 'bg-yellow-700 text-yellow-300' : 'bg-red-700 text-red-300'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex items-center justify-start space-x-3">
                                                    <button onClick={() => handleEdit(record)} title="Edit Record" className="text-blue-500 hover:text-blue-400 p-1 rounded-full hover:bg-gray-700 transition duration-150">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(record._id)} title="Delete Record" className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-700 transition duration-150">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- ADD/EDIT ADVANCE REQUEST MODAL (Unchanged) --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 overflow-hidden transform transition-all border border-blue-900/50">

                            <div className="px-6 pt-6 pb-4 border-b border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-white" id="modal-title">
                                        {isEditMode ? 'Edit Salary Advance' : 'Request Salary Advance'}
                                    </h3>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-white transition duration-150 p-1 rounded-full hover:bg-gray-700">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitAdvance} className="p-6">
                                <div className="mb-4 relative">
                                    <label htmlFor="nameInput" className="text-sm font-medium text-gray-400 block mb-1">Employee Name</label>
                                    <input
                                        type="text"
                                        id="nameInput"
                                        name="nameInput"
                                        value={formData.nameInput}
                                        onChange={handleChange}
                                        placeholder="Start typing name, e.g., Kamal"
                                        className="w-full p-3 bg-gray-900 text-white border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                                        required
                                        disabled={isEditMode}
                                    />
                                    {filteredNames.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {filteredNames.map(emp => (
                                                <li
                                                    key={emp._id}
                                                    onClick={() => handleNameSelect(emp)}
                                                    className="p-3 text-gray-200 hover:bg-blue-600/50 cursor-pointer transition duration-150"
                                                >
                                                    {emp.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {!formData.employeeId && formData.nameInput.length > 0 && (
                                        <p className="text-xs text-red-400 mt-1">Please select an employee from the list to proceed.</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="basicSalary" className="text-sm font-medium text-gray-400 block mb-1">Basic Salary (LKR)</label>
                                    <input
                                        type="text"
                                        id="basicSalary"
                                        value={formData.basicSalary ? `LKR ${formData.basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Select employee to auto-fill'}
                                        className="w-full p-3 bg-gray-700 text-green-400 border border-gray-600 rounded-lg cursor-not-allowed"
                                        readOnly
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="advanceAmount" className="text-sm font-medium text-gray-400 block mb-1">Advance Amount (LKR)</label>
                                    <input
                                        type="number"
                                        id="advanceAmount"
                                        name="advanceAmount"
                                        value={formData.advanceAmount}
                                        onChange={handleChange}
                                        placeholder={`Maximum: ${maxAdvanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                        className={`w-full p-3 bg-gray-900 text-white border ${validationErrors.advanceAmount ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500`}
                                        required
                                        min="1"
                                        step="any"
                                        disabled={!formData.employeeId}
                                    />
                                    {validationErrors.advanceAmount && (
                                        <p className="text-xs text-red-400 mt-1">{validationErrors.advanceAmount}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="reason" className="text-sm font-medium text-gray-400 block mb-1">Reason for Advance</label>
                                    <div className="relative">
                                        <select
                                            id="reason"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-gray-900 text-white border border-gray-600 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="Select Reason" disabled>Select Reason</option>
                                            <option value="Medical Emergency">Medical Emergency</option>
                                            <option value="Utility Bill Payment">Utility Bill Payment</option>
                                            <option value="Vehicle Repair/Transport">Vehicle Repair/Transport</option>
                                            <option value="Family Event">Family Event</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 w-5 h-5" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="deductionMonth" className="text-sm font-medium text-gray-400 block mb-1">Deduction Month (Salary Cycle)</label>
                                    <p className="text-xs text-gray-500 mb-1">Advance will be deducted from the salary of this month (Limited to current + 2 months).</p>
                                    <div className="relative">
                                        <select
                                            id="deductionMonth"
                                            name="deductionMonth"
                                            value={formData.deductionMonth}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-gray-900 text-white border border-gray-600 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            {deductionMonths.map(month => (
                                                <option key={month.value} value={month.value}>
                                                    {month.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 w-5 h-5" />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="processedDate" className="text-sm font-medium text-gray-400 block mb-1">Processed Date</label>
                                    <input
                                        type="text"
                                        id="processedDate"
                                        value={isEditMode ? 'Date of last update will be recorded.' : 'Date of submission will be recorded.'}
                                        className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-gray-500 cursor-not-allowed text-sm"
                                        readOnly
                                    />
                                </div>

                                <div className='flex justify-end space-x-3'>
                                    <button type="button" onClick={closeModal} className="px-6 py-2 text-white font-semibold bg-gray-600 rounded-lg hover:bg-gray-700 transition duration-150">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 text-white font-semibold bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition duration-150" disabled={loading}>
                                        {loading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Submit Advance')}
                                    </button>
                                </div>
                                {validationErrors.form && <p className="text-center text-red-400 mt-3">{validationErrors.form}</p>}
                            </form>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancePage;