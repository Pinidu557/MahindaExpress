import React, { useState } from 'react';
import { CurrencyDollarIcon, TagIcon, CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

// Mock the useNavigate hook for navigation (replace with real import)
const useNavigate = () => {
    const navigate = (path) => console.log(`[NAVIGATE MOCK] Navigating to: ${path}`);
    return navigate;
}

const CreateExpensePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log('[API MOCK] Saving New General Expense:', formData);
    
    // In a real MERN app, this calls generalExpenseController.createExpense
    try {
        // Mock successful API call
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        console.log(`[DB MOCK] Expense saved. Category '${formData.category}' is now available for budgeting.`);
        alert('Expense Saved! Category is now available for Budgets.'); // Using alert for mock feedback
        navigate('/budgets');
    } catch (error) {
        console.error("Failed to save expense:", error);
        setIsSaving(false);
    }
  };

  return (
    <div className="text-white min-h-screen p-6">
      <button 
        onClick={() => navigate('/budgets')}
        className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Budgets
      </button>

      <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-extrabold text-white mb-4">Add New General Expense</h1>
        <p className="text-slate-400 mb-8">Record an expense item. New categories added here will become available for setting budget targets.</p>

        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="category">Expense Category (e.g., Tax, Office Supplies)</label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded bg-slate-700 border border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter a new or existing category"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="amount">Amount (LKR)</label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded bg-slate-700 border border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500"
                required
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="date">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded bg-slate-700 border border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded bg-slate-700 border border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief details about the expense"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Record Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExpensePage;
