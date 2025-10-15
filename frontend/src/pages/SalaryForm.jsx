import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; 

const STAFF_API_BASE_URL = 'http://localhost:4000/staff'; 
const SALARY_API_BASE_URL = 'http://localhost:4000/api/salaries'; 

const formatLKR = (amount) => (amount || 0).toFixed(2);

// --- Calculation Constants (Mirrors Backend) ---
const EPF_EMPLOYEE_RATE = 0.08;
const WORKING_DAYS_IN_MONTH = 28; 
const OVERTIME_HOURLY_RATE_FACTOR = 1.5;

const SalaryForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: salaryId } = useParams();
    
    // Initial state setup to match the data passed from PayRollPageFinance
    const initialState = {
        staffId: location.state?.staffId || '',
        monthYear: location.state?.monthYear || '',
        
        // Employee/Staff details (will be fetched or overwritten on update)
        name: '', 
        role: '', 
        email: '',
        basicSalary: location.state?.basicSalary || 0.00,
        
        // Input fields (pre-filled from Staff model or initial calculation)
        otHours: location.state?.otHours || 0,
        noPayDays: location.state?.noPayDays || 0, 
        salaryAdvance: 0.00, 
        loan: location.state?.loan || 0.00, 
        allowances: location.state?.allowances || 0.00, 
        reimbursements: location.state?.reimbursements || 0.00,
        bonus: location.state?.bonus || 0.00,
        
        // Calculated fields (will be updated)
        overtimePay: 0.00,
        noPayDeduction: 0.00,
        employeeEpf: 0.00,
        grossSalary: 0.00,
        totalDeductions: 0.00,
        netSalary: 0.00,
        employerEpf: 0.00,
        employerEtf: 0.00,
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(true);
    const [isUpdateMode, setIsUpdateMode] = useState(!!salaryId);

    // --- Fetching Logic (UPDATED: Removed Math.max(0, ...) to allow negative retrieval) ---
    useEffect(() => {
        const fetchStaffDetails = async (id) => {
            try {
                const staffRes = await axios.get(`${STAFF_API_BASE_URL}/${id}`);
                const staffData = staffRes.data;

                // Load data as-is, allowing potential negative values from the staff record
                setFormData(prev => ({
                    ...prev,
                    name: staffData.name,
                    role: staffData.role,
                    email: staffData.email,
                    
                    // Allow retrieval of negative values here
                    basicSalary: staffData.basicSalary || prev.basicSalary,
                    loan: staffData.loan || prev.loan,
                    allowances: staffData.allowances || prev.allowances,
                    reimbursements: staffData.reimbursements || prev.reimbursements,
                    bonus: staffData.bonus || prev.bonus,
                    otHours: staffData.otHours || prev.otHours,
                    salaryAdvance: staffData.salaryAdvance || prev.salaryAdvance,
                    noPayDays: staffData.noPayDays || prev.noPayDays,
                    staffId: id,
                }));

                return true; 
            } catch (error) {
                console.error('Error fetching staff details:', error);
                toast.error('Failed to load employee information.');
                return false; 
            }
        };

        const fetchAllData = async () => {
            setLoading(true);

            if (salaryId) {
                try {
                    const response = await axios.get(`${SALARY_API_BASE_URL}/${salaryId}`);
                    const data = response.data;
                    const staffIdFromSalary = data.staff._id;

                    await fetchStaffDetails(staffIdFromSalary);
                    
                    setFormData(prev => {
                        return {
                            ...prev,
                            monthYear: data.monthYear,
                            _id: data._id, 
                            // Load saved salary fields AS-IS (potentially negative)
                            salaryAdvance: data.salaryAdvance,
                            loan: data.loan || prev.loan, 
                            otHours: data.otHours,
                            noPayDays: data.noPayDays,
                            
                            // Calculated fields (for display/re-calculation context)
                            grossSalary: data.grossSalary,
                            totalDeductions: data.totalDeductions,
                            netSalary: data.netSalary,
                            overtimePay: data.overtimePay,
                            noPayDeduction: data.noPayDeduction,
                            employeeEpf: data.employeeEpf,
                            employerEpf: data.employerEpf,
                            employerEtf: data.employerEtf,
                         };
                    });


                } catch (error) {
                    console.error('Error fetching salary record for update:', error);
                    toast.error('Failed to load salary data.');
                }
            } else if (location.state?.staffId) {
                await fetchStaffDetails(location.state.staffId);
            } else {
                toast.error('Staff ID or Salary ID is missing for payroll calculation.');
            }
            
            setLoading(false);
        };

        fetchAllData();
    }, [salaryId, location.state]);
            

    // --- Input Handler (UPDATED: Removed Math.max(0, ...) to allow user input of negatives) ---
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        // Allow the user to type negative values. We will validate them on save.
        const val = type === 'number' ? parseFloat(value) : value; 
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    // --- Core Calculation on Frontend (No change) ---
    const calculatedFields = useMemo(() => {
        const { basicSalary, allowances, reimbursements, bonus, otHours, noPayDays, salaryAdvance, loan } = formData;
        
        // Use Math.max(0, ...) locally only for calculation to prevent errors if inputs are negative
        const safeBasic = Math.max(0, basicSalary); 
        const safeOtHours = Math.max(0, otHours);
        const safeNoPayDays = Math.max(0, noPayDays);

        // 1. OT Pay and No Pay Deduction
        const hourlyRate = safeBasic / WORKING_DAYS_IN_MONTH / 8;
        const overtimePay = safeOtHours * hourlyRate * OVERTIME_HOURLY_RATE_FACTOR;
        const dailyRate = safeBasic / WORKING_DAYS_IN_MONTH;
        const noPayDeduction = safeNoPayDays * dailyRate;

        // 2. Gross Salary
        const grossSalary = safeBasic + allowances + overtimePay + reimbursements + bonus;

        // 3. Deductions
        const epfBase = grossSalary; 
        const employeeEpf = epfBase * EPF_EMPLOYEE_RATE;
        const totalLoanDeduction = loan + salaryAdvance;
        const totalDeductions = employeeEpf + noPayDeduction + totalLoanDeduction; 

        // 4. Net Pay
        const netSalary = grossSalary - totalDeductions;
        
        // Employer Contributions
        const employerEpf = safeBasic * 0.12; 
        const employerEtf = safeBasic * 0.03;

        return {
            overtimePay,
            noPayDeduction,
            employeeEpf,
            grossSalary,
            totalDeductions,
            netSalary,
            employerEpf,
            employerEtf
        };
    }, [formData]);
    
    const amountInWords = (amount) => {
    // --- Core Logic Arrays ---
    const oneToNineteen = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    // --- Utility Function to Convert a Number Block (0-999) ---
    const convertHundreds = (num) => {
        let result = '';
        
        if (num >= 100) {
            result += oneToNineteen[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }

        if (num >= 20) {
            result += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }

        if (num >= 1) {
            result += oneToNineteen[num] + ' ';
        }
        
        return result.trim();
    };
    
    // --- Main Logic ---

    // 1. Handle Zero and Sign
    if (amount === 0) {
        return 'LKR Zero Rupees Only';
    }

    const absoluteAmount = Math.abs(amount);
    
    // 2. Separate Rupees (Integer) and Cents (Decimal)
    const rupees = Math.floor(absoluteAmount);
    // Extract cents: multiply by 100 and round to handle floating point issues
    const cents = Math.round((absoluteAmount - rupees) * 100);

    let words = '';

    // --- Part 1: Convert Rupees (using Indian numbering system: Crore, Lakh, Thousand) ---
    let crore = Math.floor(rupees / 10000000); // 1 Crore = 10 Million
    let lakh = Math.floor((rupees % 10000000) / 100000); // 1 Lakh = 100 Thousand
    let thousand = Math.floor((rupees % 100000) / 1000);
    let remainder = rupees % 1000;

    if (crore > 0) {
        words += convertHundreds(crore) + ' Crore ';
    }
    if (lakh > 0) {
        words += convertHundreds(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        words += convertHundreds(thousand) + ' Thousand ';
    }
    
    if (remainder > 0) {
        words += convertHundreds(remainder);
    }
    
    // Base part of the string
    words = `LKR ${words.trim()}`;
    
    // Append "Rupees"
    if (rupees > 0) {
        words += ' Rupees';
    } else {
         // Case where amount is < 1 (e.g., 0.59)
        words += ' Zero Rupees'; 
    }

    // --- Part 2: Convert Cents ---
    if (cents > 0) {
        // Add "and" separator if there were rupees
        if (rupees > 0) {
             words += ' and ';
        } else {
            // If only cents, clear previous "LKR Zero Rupees" and restart
            words = 'LKR ';
        }
       
        words += convertHundreds(cents) + ' Cents';
    }

    // Add "Only" suffix and handle negative sign if needed (though typically not for advances)
    if (amount < 0) {
        words = `Negative ${words}`;
    }

    return `${words.trim()} Only`;
};

    // --- Save/Update Handler (The core restriction logic) ---
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { netSalary } = calculatedFields;
        const { 
            basicSalary, allowances, reimbursements, bonus, 
            otHours, noPayDays, 
            salaryAdvance, loan 
        } = formData;
        
        // ** 1. CRITICAL VALIDATION CHECK: CHECK FOR ANY NEGATIVE INPUT **
        const fieldsToCheck = {
            'Basic Salary': basicSalary,
            'Allowances': allowances,
            'Reimbursements': reimbursements,
            'Bonus': bonus,
            'OT Hours': otHours,
            'No Pay Days': noPayDays,
            'Salary Advance': salaryAdvance,
            'Loan Deduction': loan,
        };
        
        const negativeFields = [];
        for (const [fieldName, value] of Object.entries(fieldsToCheck)) {
            // Check if the value is numerically negative and not 0 or positive
            if (value < 0) {
                negativeFields.push(fieldName);
            }
        }
        
        if (negativeFields.length > 0) {
            toast.error(
                `Error: The following field(s) contain negative values and must be corrected before saving: ${negativeFields.join(', ')}. Please check again.`
            );
            setLoading(false);
            return; // STOP SAVE
        }
        
        // ** 2. BUSINESS LOGIC CHECK **
        
        if (basicSalary <= 0) {
            toast.error('Basic Salary must be greater than LKR 0.00 to process payroll.');
            setLoading(false);
            return; // STOP SAVE
        }

        if (netSalary < 0) {
            toast.error('Net Salary cannot be negative. Please check deductions (No Pay, Loan, Advance).');
            setLoading(false);
            return; // STOP SAVE
        }
        
        // ** 3. PREPARE PAYLOAD AND SAVE **
        // ... (Payload creation remains the same)

        const payload = {
            _id: isUpdateMode ? formData._id : undefined,
            staffId: formData.staffId, 
            monthYear: formData.monthYear,
            
            // Input fields
            otHours: formData.otHours,
            basicSalary: formData.basicSalary,
            allowances: formData.allowances,
            reimbursements: formData.reimbursements,
            bonus: formData.bonus,
            noPayDays: formData.noPayDays,
            salaryAdvance: formData.salaryAdvance,
            loan: formData.loan,

            // Calculated fields
            overtimePay: calculatedFields.overtimePay,
            noPayDeduction: calculatedFields.noPayDeduction,
            employeeEpf: calculatedFields.employeeEpf,
            grossSalary: calculatedFields.grossSalary,
            totalDeductions: calculatedFields.totalDeductions,
            netSalary: calculatedFields.netSalary,
            employerEpf: calculatedFields.employerEpf,
            employerEtf: calculatedFields.employerEtf,
        };

        const url = isUpdateMode ? `${SALARY_API_BASE_URL}/${salaryId}` : `${SALARY_API_BASE_URL}/save`;
        const method = isUpdateMode ? 'put' : 'post';

        try {
            await axios[method](url, payload);
            toast.success(`Salary ${isUpdateMode ? 'updated' : 'calculated'} and saved!`);
            navigate('/finance/payroll'); 
        } catch (error) {
            console.error('Error saving salary:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to save salary. Check console.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div className="p-8 text-center text-white bg-gray-900 min-h-screen">Loading...</div>;
    
    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <div className="max-w-6xl mx-auto p-5 bg-gray-800 shadow-xl rounded-lg text-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-400 mb-2">Salary Calculation Form</h1>
                    <p className="text-gray-400 text-lg">
                        {formData.name ? `For ${formData.name} - ${formData.monthYear}` : 'New Calculation'}
                    </p>
                </div>

                <form onSubmit={handleSave}>
                    <div className="flex flex-col gap-5">
                        {/* Employee Info & EPF/ETF */}
                        <div className="flex justify-between gap-5">
                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-5 flex-1">
                                <h2 className="text-indigo-400 mt-0 mb-4 border-b border-indigo-600 pb-2">Staff Information</h2>
                                <p className="mb-2.5"><span className="font-bold text-gray-400">Name:</span> <span className="float-right">{formData.name}</span></p>
                                <p className="mb-2.5"><span className="font-bold text-gray-400">Designation:</span> <span className="float-right">{formData.role}</span></p>
                                <p className="mb-2.5"><span className="font-bold text-gray-400">Email:</span> <span className="float-right">{formData.email}</span></p>
                            </div>

                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-5 flex-1">
                                <h2 className="text-indigo-400 mt-0 mb-4 border-b border-indigo-600 pb-2 text-lg">EPF & ETF Contributions</h2>
                                <div className="flex justify-around text-center gap-2.5">
                                    <div className="flex-1 p-4 border border-gray-600 rounded-lg bg-gray-800">
                                        <span className="font-bold text-gray-400 block">ETF (Employer)</span>
                                        <span className="block text-lg mt-1 text-indigo-400">LKR. {formatLKR(calculatedFields.employerEtf)}</span>
                                    </div>
                                    <div className="flex-1 p-4 border border-gray-600 rounded-lg bg-gray-800">
                                        <span className="font-bold text-gray-400 block">EPF (Employer)</span>
                                        <span className="block text-lg mt-1 text-indigo-400">LKR. {formatLKR(calculatedFields.employerEpf)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance (Inputs) */}
                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-5">
                            <h2 className="text-indigo-400 mt-0 mb-4 border-b border-indigo-600 pb-2">Attendance/No-Pay Inputs</h2>
                            <div className="flex justify-between gap-5">
                                <div className="flex-1">
                                    <label htmlFor="otHours" className="font-bold text-gray-400 block mb-1">OT Hours (Auto-calculated, override if needed):</label>
                                    <input type="number" name="otHours" id="otHours" step="0.5" 
                                        value={formData.otHours} onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-right focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="noPayDays" className="font-bold text-gray-400 block mb-1">No Pay Days (Auto-calculated, override if needed):</label>
                                    <input type="number" name="noPayDays" id="noPayDays" step="1" 
                                        value={formData.noPayDays} onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-right focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-t border-gray-700 my-4" />

                        {/* Earnings & Deductions Calculations */}
                        <div className="flex justify-between gap-5">
                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-5 flex-1">
                                <h2 className="text-indigo-400 mt-0 mb-4 border-b border-indigo-600 pb-2">Earnings</h2>
                                
                                <div className="flex justify-between mb-2.5">
                                    <span className="font-bold text-gray-400">Basic Salary:</span>
                                    <div className="flex items-center justify-end w-40 border border-gray-600 rounded bg-gray-800">
                                        <span className="px-1 text-gray-500">LKR.</span>
                                        <input type="number" name="basicSalary" step="0.01" 
                                            value={formData.basicSalary} onChange={handleInputChange}
                                            className="w-full border-none pr-2 bg-transparent text-right" 
                                        />
                                    </div>
                                </div>

                                {/* Allowances (Editable) */}
                                <div className="mb-2.5">
                                    <label htmlFor="allowances" className="font-bold text-gray-400 block">Allowances:</label>
                                    <div className="flex items-center justify-end w-full border border-gray-600 rounded bg-gray-800">
                                        <span className="px-2 text-gray-500">LKR.</span>
                                        <input type="number" name="allowances" id="allowances" step="0.01" 
                                            value={formData.allowances} onChange={handleInputChange}
                                            className="w-full border-none pr-2 bg-transparent text-right" 
                                        />
                                    </div>
                                </div>

                                <h4 className="text-indigo-400 border-b border-gray-600 pb-1.5 mb-4 mt-4">Additional Perks:</h4>
                                
                                <div className="pl-5 flex justify-between mb-2.5">
                                    <span className="font-bold text-gray-400">Overtime Pay (Calculated):</span>
                                    <span className="text-indigo-400 font-semibold">LKR. {formatLKR(calculatedFields.overtimePay)}</span>
                                </div>
                                
                                {/* Reimbursements (Editable) */}
                                <div className="mb-2.5">
                                    <label htmlFor="reimbursements" className="font-bold text-gray-400 block">Reimbursements:</label>
                                    <div className="flex items-center justify-end w-full border border-gray-600 rounded bg-gray-800">
                                        <span className="px-2 text-gray-500">LKR.</span>
                                        <input type="number" name="reimbursements" id="reimbursements" step="0.01" 
                                            value={formData.reimbursements} onChange={handleInputChange}
                                            className="w-full border-none pr-2 bg-transparent text-right" 
                                        />
                                    </div>
                                </div>
                                
                                {/* Bonus (Editable) */}
                                <div className="mb-2.5">
                                    <label htmlFor="bonus" className="font-bold text-gray-400 block">Bonus:</label>
                                    <div className="flex items-center justify-end w-full border border-gray-600 rounded bg-gray-800">
                                        <span className="px-2 text-gray-500">LKR.</span>
                                        <input type="number" name="bonus" id="bonus" step="0.01" 
                                            value={formData.bonus} onChange={handleInputChange}
                                            className="w-full border-none pr-2 bg-transparent text-right" 
                                        />
                                    </div>
                                </div>

                                <div className="font-bold text-xl mt-5 pt-2.5 border-t-2 border-indigo-600 flex justify-between">
                                    <span className="text-indigo-400">Gross Salary : </span>
                                    <span className="text-indigo-400">LKR. {formatLKR(calculatedFields.grossSalary)}</span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-5 flex-1">
                                <h2 className="text-indigo-400 mt-0 mb-4 border-b border-indigo-600 pb-2">Deductions</h2>
                                
                                <div className="flex justify-between mb-2.5">
                                    <span className="font-bold text-gray-400">No Pay Days Deduction (Calculated):</span>
                                    <span className="text-red-400 font-semibold">LKR. {formatLKR(calculatedFields.noPayDeduction)}</span>
                                </div>
                                
                                {/* Salary Advance (Editable) */}
                                <div className="mb-2.5">
                                    <label htmlFor="salaryAdvance" className="font-bold text-gray-400 block">Salary Advance:</label>
                                    <div className="flex items-center justify-end w-full border border-gray-600 rounded bg-gray-800">
                                        <span className="px-2 text-gray-500">LKR.</span>
                                        <input type="number" name="salaryAdvance" id="salaryAdvance" step="0.01" 
                                            value={formData.salaryAdvance} onChange={handleInputChange}
                                            className="w-full border-none pr-2 bg-transparent text-right" 
                                        />
                                    </div>
                                </div>
                                
                                {/* Loan (Editable) */}
                                <div className="mb-2.5">
                                    <label htmlFor="loan" className="font-bold text-gray-400 block">Loan Deduction (Monthly Installment):</label>
                                    <div className="flex items-center justify-end w-full border border-gray-600 rounded bg-gray-800">
                                        <span className="px-2 text-gray-500">LKR.</span>
                                        <input type="number" name="loan" id="loan" step="0.01" 
                                            value={formData.loan} onChange={handleInputChange}
                                            className="w-full border-none pr-2 bg-transparent text-right" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-between mb-2.5">
                                    <span className="font-bold text-gray-400">EPF (8% - Calculated):</span>
                                    <span className="text-red-400 font-semibold">LKR. {formatLKR(calculatedFields.employeeEpf)}</span>
                                </div>

                                <div className="font-bold text-xl mt-5 pt-2.5 border-t-2 border-indigo-600 flex justify-between">
                                    <span className="text-indigo-400">Total Deductions:</span>
                                    <span className="text-red-400">LKR. {formatLKR(calculatedFields.totalDeductions)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Net Salary Total */}
                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-5 mt-5">
                            <div className="text-3xl text-green-400 flex justify-center gap-12">
                                <span className="font-bold">Net Salary:</span>
                                <span className="font-bold">LKR. {formatLKR(calculatedFields.netSalary)}</span>
                            </div>
                        </div>

                        {/* Amount in Words */}
                        <div className="text-xl font-bold mt-5 p-4 bg-green-900 border-l-4 border-green-500 rounded">
                            <span className="text-gray-400">Amount in Words:</span>
                            <span className="font-normal text-green-400 block text-lg mt-1">{amountInWords(calculatedFields.netSalary)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-5 py-2.5 bg-gray-600 text-white rounded cursor-pointer font-bold transition-all duration-300 hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-green-500 text-white rounded cursor-pointer font-bold transition-all duration-300 hover:bg-green-600 disabled:bg-gray-500"
                            >
                                {loading ? 'Saving...' : 'Save Calculation'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SalaryForm;