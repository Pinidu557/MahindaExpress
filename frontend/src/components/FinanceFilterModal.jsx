import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const statusOptions = ['Active', 'Deducted', 'Cancelled'];
const reasonOptions = [
    'Medical Emergency', 
    'Utility Bill Payment', 
    'Vehicle Repair/Transport', 
    'Family Event', 
    'Other'
];

const FinanceFilterModal = ({ filters, setFilters }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFilter = (category, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: prev[category].includes(value)
                ? prev[category].filter(item => item !== value)
                : [...prev[category], value]
        }));
    };

    const clearAll = () => {
        setFilters({ status: [], reason: [] });
    };

    const totalActiveFilters = filters.status.length + filters.reason.length;

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-full md:w-auto px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-900 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-700 transition duration-150"
            >
                <Filter className="mr-2 w-4 h-4" /> Filters ({totalActiveFilters})
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Filters</h3>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-gray-400 hover:text-white transition duration-150 p-1 rounded-full hover:bg-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Status Filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            {statusOptions.map(option => (
                                <label key={option} className="flex items-center space-x-2 p-1">
                                    <input
                                        type="checkbox"
                                        checked={filters.status.includes(option)}
                                        onChange={(e) => toggleFilter('status', option)}
                                        className="rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-200 text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                        
                        {/* Reason Filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                            {reasonOptions.map(option => (
                                <label key={option} className="flex items-center space-x-2 p-1">
                                    <input
                                        type="checkbox"
                                        checked={filters.reason.includes(option)}
                                        onChange={(e) => toggleFilter('reason', option)}
                                        className="rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-200 text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-2">
                            <button 
                                onClick={clearAll}
                                className="px-4 py-2 text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-150 text-sm"
                            >
                                Clear All
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition duration-150 text-sm"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FinanceFilterModal;