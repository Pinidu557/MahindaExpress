import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import axios from 'axios'; 
// import { useNavigate } from 'react-router-dom'; // UNCOMMENT THIS LINE FOR REAL APP

// --- NAVIGATION PLACEHOLDER (Use the real hook in your application) ---
const useNavigate = () => {
    // Placeholder function until you connect the real react-router-dom
    return (path) => {
        console.log(`[NAVIGATE]: Simulating real navigation to: ${path}`);
    };
};
// ----------------------------------------------------------------------


// --- CONFIGURATION (UPDATED BASED ON SCHEMAS) ---
const CORE_EXPENSES = [
    { name: 'Fuel', sourceType: 'fuels', transactionField: 'totalCost' }, 
    { name: 'Maintenance', sourceType: 'maintenances', transactionField: 'serviceCost' }, 
    { name: 'Parts', sourceType: 'parts', transactionField: 'cost' }, 
    { name: 'Salaries', sourceType: 'salaries', transactionField: 'netSalary' },
];

// Helper to determine the sourceType (collection name) and the transaction field.
const getSourceTypeAndField = (categoryName) => {
    const coreExpense = CORE_EXPENSES.find(e => e.name === categoryName);
    if (coreExpense) {
        return { 
            sourceType: coreExpense.sourceType, 
            transactionField: coreExpense.transactionField 
        };
    }
    // Assumes all other categories map to generalExpenses/amount by default
    return { sourceType: 'generalExpenses', transactionField: 'amount' }; 
};

// Base URL for your MERN backend (change this to your actual server address)
const API_BASE_URL = 'http://localhost:4000/api'; 

// --- DATE HELPER FUNCTIONS FOR NATIVE INPUT ---

// Converts 'YYYY-MM' to 'Month Year' for display and API
const formatMonthForDisplay = (ymString) => {
    if (!ymString) return '';
    try {
        const [year, month] = ymString.split('-');
        // Use the month number (1-12) to create a date object
        const date = new Date(year, month - 1, 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Gets the current month in 'YYYY-MM' format for initial state
const getInitialMonth = () => {
    const now = new Date();
    // Use September 2025 (2025-09) as the default if the current date is before that
    const minDate = new Date(2025, 8, 1); 
    const date = now < minDate ? minDate : now;
    
    const year = date.getFullYear();
    // Month needs zero padding (09, 10, 11, 12)
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`; // e.g., '2025-10'
};

// --- ACTUAL AXIOS API FUNCTIONS (MERN Backend Calls) ---
const api = {
    getBudgetsAndActuals: async (monthYear) => {
        // monthYear is the 'Month Year' string (e.g., 'October 2025')
        const response = await axios.get(`${API_BASE_URL}/budgets`, {
            params: { monthYear }
        });
        return response.data;
    },
    saveBudget: async (budgetData) => {
        if (budgetData.id) {
            // PUT for update
            const response = await axios.put(`${API_BASE_URL}/budgets/${budgetData.id}`, budgetData);
            return response.data;
        } else {
            // POST for creation
            const response = await axios.post(`${API_BASE_URL}/budgets`, budgetData);
            return response.data;
        }
    },
    deleteBudget: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/budgets/${id}`);
        return response.data; 
    },
    getGeneralExpenseCategories: async () => {
        // Fetches list of categories set up in the General Expense schema (if applicable)
        const response = await axios.get(`${API_BASE_URL}/general-expenses/categories`);
        return response.data;
    }
};

const currencyFormat = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Component to visualize the budget status (unchanged)
const BudgetGauge = ({ percentage }) => {
    const color = useMemo(() => {
        if (percentage > 100) return 'bg-red-500'; 
        if (percentage > 90) return 'bg-orange-500'; 
        if (percentage > 70) return 'bg-yellow-500'; 
        return 'bg-green-500'; 
    }, [percentage]);

    const widthStyle = `${Math.min(percentage, 100)}%`;

    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
                style={{ width: widthStyle }}
                title={`${percentage.toFixed(0)}% of budget used`}
            ></div>
            {percentage > 100 && (
                <span className="text-red-400 text-xs font-semibold ml-1 block -mt-5">
                    {percentage.toFixed(0)}%
                </span>
            )}
        </div>
    );
};

// --------------------------------------------------------------------------------
// --- BudgetFormModal (UNCHANGED) ---
// --------------------------------------------------------------------------------

const BudgetFormModal = ({ isOpen, onClose, budget: currentBudgetEdit, monthYear: selectedMonth, onSave: handleSaveBudget, budgetOptions, isLoading, availableBudgetTypes }) => {
    
    // selectedMonth passed here is the formatted string ('Month Year')
    const isEditing = !!currentBudgetEdit;
    const initialCategory = currentBudgetEdit?.budgetCategory || budgetOptions[0] || '';
    const initialSourceInfo = getSourceTypeAndField(initialCategory);
    const initialAmount = currentBudgetEdit?.targetAmount ?? '';

    const getInitialAmountError = (amount) => {
        const numValue = parseFloat(amount);
        if (amount === '' || isNaN(numValue) || numValue <= 0) {
            return 'Target amount must be greater than LKR 0.00 (no minus or zero value).';
        }
        return '';
    }

    const [amountError, setAmountError] = useState(getInitialAmountError(initialAmount));
    const [formData, setFormData] = useState(() => {
        return {
            budgetCategory: initialCategory,
            targetAmount: initialAmount,
            monthYear: selectedMonth, 
            sourceType: currentBudgetEdit?.sourceType || initialSourceInfo.sourceType,
            transactionField: currentBudgetEdit?.transactionField || initialSourceInfo.transactionField,
        };
    });
    
    useEffect(() => {
        const newMonthYear = selectedMonth; // This is the 'Month Year' string
        
        if (currentBudgetEdit) {
            // Edit mode
            setFormData({
                budgetCategory: currentBudgetEdit.budgetCategory,
                targetAmount: currentBudgetEdit.targetAmount.toString(),
                monthYear: newMonthYear,
                sourceType: currentBudgetEdit.sourceType,
                transactionField: currentBudgetEdit.transactionField,
            });
            setAmountError(getInitialAmountError(currentBudgetEdit.targetAmount));
        } else {
            // New budget mode
            const newInitialCategory = budgetOptions[0] || '';
            const newInitialSourceInfo = getSourceTypeAndField(newInitialCategory);
            setFormData({
                budgetCategory: newInitialCategory,
                targetAmount: '',
                monthYear: newMonthYear,
                sourceType: newInitialSourceInfo.sourceType,
                transactionField: newInitialSourceInfo.transactionField,
            });
            setAmountError(getInitialAmountError(''));
        }
    }, [currentBudgetEdit, selectedMonth, budgetOptions, availableBudgetTypes]);


    useEffect(() => {
        if (!isEditing && formData.budgetCategory) { 
            const { sourceType, transactionField } = getSourceTypeAndField(formData.budgetCategory);
            setFormData(prev => ({ ...prev, sourceType, transactionField }));
        }
    }, [formData.budgetCategory, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'targetAmount') {
            const numValue = parseFloat(value);
            
            if (value === '' || isNaN(numValue) || numValue <= 0) {
                setAmountError('Target amount must be greater than LKR 0.00 (no minus or zero value).');
            } else {
                setAmountError(''); 
            }
            
            setFormData(prev => ({ ...prev, [name]: value }));

        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const isFormValid = !isLoading && !amountError && parseFloat(formData.targetAmount) > 0 && formData.budgetCategory; 

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!isFormValid) {
            if (parseFloat(formData.targetAmount) <= 0 || isNaN(parseFloat(formData.targetAmount))) {
                setAmountError('Target amount must be greater than LKR 0.00 (no minus or zero value).');
            }
            console.error("Form is invalid. Cannot submit.");
            return;
        }

        handleSaveBudget({
            ...currentBudgetEdit,
            ...formData,
            id: currentBudgetEdit?._id, 
            targetAmount: parseFloat(formData.targetAmount), 
        });
    };
    
    if (!isOpen) return null;

    const categoryOptionsList = isEditing ? [formData.budgetCategory] : budgetOptions;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-900 p-6 rounded-xl w-full max-w-lg shadow-2xl border border-blue-600 animate-in fade-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-blue-400 mb-6 border-b border-slate-700 pb-2">
                    {isEditing ? `Edit Target for: ${formData.budgetCategory}` : 'Create New Budget Target'}
                </h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* 1. Category Dropdown */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="budgetCategory">Budget Category</label>
                        <select
                            id="budgetCategory"
                            name="budgetCategory"
                            value={formData.budgetCategory}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            required
                            disabled={isEditing || categoryOptionsList.length === 0} 
                        >
                            <option value="" disabled>Select a Category</option>
                            {categoryOptionsList.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {!isEditing && budgetOptions.length === 0 && availableBudgetTypes.length > 0 && (
                             <p className="mt-1 text-sm text-yellow-500">All available categories have a budget set for this month.</p>
                        )}
                         {!isEditing && availableBudgetTypes.length === 0 && (
                            <p className="mt-1 text-sm text-red-500">No expense categories have been created yet. Please create categories first.</p>
                        )}
                    </div>
                    
                    {/* 2. Target Amount Input (LKR Value > 0) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="targetAmount">Monthly Target (LKR)</label>
                        <input
                            type="number"
                            id="targetAmount"
                            name="targetAmount"
                            value={formData.targetAmount}
                            onChange={handleChange}
                            placeholder="e.g., 50000.00"
                            className={`w-full p-3 rounded-lg bg-slate-800 border ${amountError ? 'border-red-500' : 'border-slate-700'} text-white focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                            required
                            step="0.01" 
                            min="0.01" 
                        />
                        {amountError && (
                            <p className="mt-1 text-sm text-red-500">{amountError}</p>
                        )}
                    </div>

                    {/* 3. Budget Set Date (Read-Only) */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="monthYear">Budget Month/Year (Set Date)</label>
                        <input
                            type="text"
                            id="monthYear"
                            name="monthYear"
                            value={formData.monthYear}
                            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 cursor-not-allowed opacity-70"
                            readOnly
                        />
                        <p className="mt-1 text-xs text-slate-500">The budget is set for the currently selected month and year.</p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-900/50 disabled:opacity-50"
                            disabled={!isFormValid || isLoading} 
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                            {isEditing ? 'Update Target' : 'Save Target'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------------
// --- Delete Confirmation Modal (Unchanged) ---
// --------------------------------------------------------------------------------

const DeleteConfirmationModal = ({ id, budgets, monthYear, onConfirm, onClose, isLoading }) => {
    const budgetToDelete = budgets.find(b => b._id === id); 

    if (!budgetToDelete) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-900 p-6 rounded-xl w-full max-w-sm shadow-2xl border border-red-600 animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-400 text-center mb-3">Confirm Deletion</h2>
                <p className="text-slate-300 text-center mb-6">
                    Are you sure you want to delete the budget for **{budgetToDelete.budgetCategory}** in **{monthYear}**? This action cannot be reversed.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(id)}
                        className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md shadow-red-900/50 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <TrashIcon className="w-5 h-5" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --------------------------------------------------------------------------------
// --- Main BudgetsPage Component ---
// --------------------------------------------------------------------------------

const BudgetsPage = () => {
    // You should replace this with the real hook: const navigate = useNavigate();
    const navigate = useNavigate();
    
    // State stores month in 'YYYY-MM' format (e.g., '2025-10') for native input compatibility
    const [selectedMonthRaw, setSelectedMonthRaw] = useState(getInitialMonth()); 
    
    const [budgets, setBudgets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBudgetEdit, setCurrentBudgetEdit] = useState(null); 
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [availableBudgetTypes, setAvailableBudgetTypes] = useState([]); 
    
    // Derived state for display and API calls
    const selectedMonthFormatted = useMemo(() => 
        formatMonthForDisplay(selectedMonthRaw), 
    [selectedMonthRaw]);
    
    const categoriesInUse = useMemo(() => 
        budgets.map(b => b.budgetCategory)
    , [budgets]);
    
    const budgetOptions = useMemo(() => {
        return availableBudgetTypes.filter(type => !categoriesInUse.includes(type));
    }, [availableBudgetTypes, categoriesInUse]);

    // --- Data Fetching ---
    const fetchBudgets = useCallback(async (monthRaw) => {
        setIsLoading(true);
        // Convert the 'YYYY-MM' state value to 'Month Year' string for the backend API
        const monthFormatted = formatMonthForDisplay(monthRaw);
        
        try {
            const [fetchedBudgetsResponse, generalCategoriesResponse] = await Promise.all([
                api.getBudgetsAndActuals(monthFormatted),
                api.getGeneralExpenseCategories(),
            ]);

            // Assuming the backend returns an array of budget objects, each with a _id
            setBudgets(fetchedBudgetsResponse.map(b => ({...b, id: b._id}))); 
            
            // Combine Core Expenses and General Expense Categories for a complete list
            const allTypes = [...CORE_EXPENSES.map(e => e.name), ...generalCategoriesResponse];
            setAvailableBudgetTypes([...new Set(allTypes)]);

        } catch(error) {
            console.error("Failed to fetch budgets:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Use the raw state value ('YYYY-MM') for the useEffect dependency
        fetchBudgets(selectedMonthRaw);
    }, [selectedMonthRaw, fetchBudgets]);

    // Calculate overall metrics (unchanged)
    const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.targetAmount, 0), [budgets]);
    const totalSpent = useMemo(() => budgets.reduce((sum, b) => sum + b.actualAmount, 0), [budgets]);
    const overallUsage = useMemo(() => totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0, [totalSpent, totalBudget]);

    // Determine critical alerts (unchanged)
    const budgetBreaches = useMemo(() => {
        return budgets.filter(b => b.actualAmount > b.targetAmount);
    }, [budgets]);

    // --- CRUD Handlers ---
    
    const handleEdit = useCallback((budget = null) => {
        // Allow modal open if no types exist so the user sees the appropriate message.
       /* if (!budget && availableBudgetTypes.length === 0) {
             console.log("No categories exist. Simulating navigation to /settings/expense-types");
             // Navigate to expense settings page if no categories exist
             navigate('/settings/expense-types'); 
             return;
        }*/

        setCurrentBudgetEdit(budget);
        setIsModalOpen(true);
    }, [availableBudgetTypes.length, navigate]); 

    const handleSaveBudget = async (data) => {
        setIsLoading(true);
        try {
            const dataToSave = {
                ...data,
                id: data.id || null, 
                ...getSourceTypeAndField(data.budgetCategory) 
            };

            await api.saveBudget(dataToSave);
            // Pass the RAW value to fetch the updated data
            await fetchBudgets(selectedMonthRaw); 
        } catch (error) {
            console.error("Failed to save budget:", error);
        } finally {
            setIsModalOpen(false);
            setCurrentBudgetEdit(null);
            setIsLoading(false);
        }
    };
    
    const handleDeleteConfirm = useCallback(async (id) => {
        setIsLoading(true);
        try {
            await api.deleteBudget(id); 
            // Pass the RAW value to fetch the updated data
            await fetchBudgets(selectedMonthRaw); 
        } catch (error) {
            console.error("Failed to delete budget:", error);
        } finally {
            setConfirmDeleteId(null);
            setIsLoading(false);
        }
    }, [selectedMonthRaw, fetchBudgets]);

    // --- RENDERING ---
    return (
        <div className="text-white min-h-screen p-4 sm:p-6 md:p-8 bg-slate-900">
            {isModalOpen && (
                <BudgetFormModal 
                    isOpen={isModalOpen} 
                    onClose={() => {setIsModalOpen(false); setCurrentBudgetEdit(null);}} 
                    budget={currentBudgetEdit} 
                    // Pass the formatted string to the modal
                    monthYear={selectedMonthFormatted} 
                    onSave={handleSaveBudget} 
                    budgetOptions={budgetOptions}
                    availableBudgetTypes={availableBudgetTypes}
                    isLoading={isLoading}
                />
            )}
            
            {confirmDeleteId && (
                <DeleteConfirmationModal 
                    id={confirmDeleteId} 
                    budgets={budgets} 
                    // Pass the formatted string to the modal
                    monthYear={selectedMonthFormatted}
                    onConfirm={handleDeleteConfirm} 
                    onClose={() => setConfirmDeleteId(null)}
                    isLoading={isLoading}
                />
            )}
            
            {/* Header and Month Selector (NATIVE IMPLEMENTATION) */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-700 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-400">Financial Budgets</h1>
                    <p className="text-slate-400 mt-1">Set, track, and manage monthly expenditure targets for key operational areas.</p>
                </div>
                <div className="flex space-x-4 mt-4 md:mt-0 items-center">
                    
                    {/* NATIVE MONTH INPUT FIELD */}
                    <input
                        type="month"
                        value={selectedMonthRaw}
                        onChange={(e) => setSelectedMonthRaw(e.target.value)}
                        // Set the required range for the native calendar picker (YYYY-MM format)
                        min="2025-09" 
                        max="2100-12"
                        className="p-3 rounded-lg bg-slate-800 border border-blue-700 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer w-40 h-12 appearance-none"
                        disabled={isLoading}
                    />

                    <button
                        onClick={() => handleEdit(null)}
                        className={`px-5 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-[1.03] shadow-lg shadow-blue-900/50 flex items-center gap-2 whitespace-nowrap ${isLoading || (budgetOptions.length === 0 && availableBudgetTypes.length > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        // disabled={isLoading || (budgetOptions.length === 0 && availableBudgetTypes.length > 0)}
                        title={budgetOptions.length === 0 && availableBudgetTypes.length > 0 ? "All available categories have a budget set." : (availableBudgetTypes.length === 0 ? "No expense categories available. Click to go to settings." : "Set a budget for an available category.")}
                    >
                        <PlusIcon className="w-5 h-5" /> 
                        {'New Budget'}
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="text-center py-20 text-blue-400 flex flex-col items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p>Loading budgets and calculating actual spent...</p>
                </div>
            ) : (
                <>
                {/* Budget Breach Alert */}
                {budgetBreaches.length > 0 && (
                    <div className="mb-6 p-5 rounded-xl bg-red-900/50 border-l-4 border-red-500 shadow-xl flex items-start gap-4 animate-in slide-in-from-top-10 duration-300">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-bold text-red-300">Budget Breach Alert!</h3>
                        <p className="text-red-200 text-sm mt-1">
                        Immediate action required: The following **{budgetBreaches.length}** category(s) have exceeded their monthly target for **{selectedMonthFormatted}**.
                        </p>
                        <ul className="list-disc list-inside text-red-200 text-sm mt-3 space-y-1">
                        {budgetBreaches.map(b => (
                            <li key={b.id} className='font-semibold'>
                            {b.budgetCategory} is over budget by {currencyFormat(b.actualAmount - b.targetAmount)}.
                            </li>
                        ))}
                        </ul>
                    </div>
                    </div>
                )}
                
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-all duration-300 hover:border-green-500 hover:shadow-green-900/30">
                    <p className="text-sm font-medium text-green-400">Total Monthly Target</p>
                    <h2 className="text-4xl font-extrabold mt-1 text-white">{currencyFormat(totalBudget)}</h2>
                    <p className="text-xs text-slate-500 mt-2">Target expenditure for {selectedMonthFormatted}</p>
                    </div>
                    
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-all duration-300 hover:border-red-500 hover:shadow-red-900/30">
                    <p className="text-sm font-medium text-red-400">Total Actual Spending</p>
                    <h2 className="text-4xl font-extrabold mt-1 text-white">{currencyFormat(totalSpent)}</h2>
                    <p className="text-xs text-slate-500 mt-2">Accumulated spending in {selectedMonthFormatted}</p>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-all duration-300 hover:border-blue-500 hover:shadow-blue-900/30">
                    <p className="text-sm font-medium text-blue-400">Overall Budget Usage</p>
                    <h2 className="text-4xl font-extrabold mt-1 text-white">{overallUsage.toFixed(1)}%</h2>
                    <div className="mt-4">
                        <BudgetGauge percentage={overallUsage} />
                        <p className="text-xs text-slate-500 mt-2">Tracking all categories collectively.</p>
                    </div>
                    </div>
                </div>

                {/* Budget Tracking Table */}
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6 text-blue-400" />
                    Detailed Budget vs. Actual
                </h2>
                
                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-slate-950/50 border border-slate-700">
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/70">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Source Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Target (LKR)</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actual (LKR)</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Usage %</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                        {budgets.map(budget => {
                            const usage = budget.targetAmount > 0 ? (budget.actualAmount / budget.targetAmount) * 100 : (budget.actualAmount > 0 ? 1000 : 0);
                            const statusColor = usage > 100 ? 'text-red-400 bg-red-900/50' : (usage > 90 ? 'text-orange-400 bg-orange-900/50' : (usage > 70 ? 'text-yellow-400 bg-yellow-900/50' : 'text-green-400 bg-green-900/50'));
                            
                            return (
                            <tr key={budget._id} className="hover:bg-slate-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{budget.budgetCategory}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">{budget.sourceType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">{currencyFormat(budget.targetAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{currencyFormat(budget.actualAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <BudgetGauge percentage={usage} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                                    {usage > 100 ? 'BREACHED' : (usage > 90 ? 'CRITICAL' : (usage > 70 ? 'WARNING' : 'OK'))}
                                </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end">
                                <button
                                    onClick={() => handleEdit(budget)}
                                    className="text-blue-500 hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-slate-700"
                                    title="Edit Budget"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(budget._id)} 
                                    className="text-red-500 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-slate-700 ml-1"
                                    title="Delete Budget"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                    {budgets.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-slate-500">
                            No budgets set for **{selectedMonthFormatted}**. Click "New Budget" to start planning!
                        </div>
                    )}
                </div>
                
                {/* Quick link to Add New Expense (Transaction) */}
                <div className='flex justify-end mt-6'>
                    <button
                        // This navigation call will need to be handled by your real router
                        onClick={() => navigate('/create-expense')}
                        className='px-5 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-[1.02] shadow-lg shadow-purple-900/50 flex items-center gap-2'
                    >
                        <PlusIcon className="w-5 h-5" /> Log New Expense (Transaction)
                    </button>
                </div>
                </>
            )}
        </div>
    );
};

export default BudgetsPage;