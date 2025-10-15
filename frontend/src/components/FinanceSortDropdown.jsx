import React, { useState } from 'react';
import { SortAsc } from 'lucide-react';

const FinanceSortDropdown = ({ sortConfig, setSortConfig }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const sortOptions = [
        { label: 'Date (Newest)', key: 'processedDate', direction: 'desc' },
        { label: 'Date (Oldest)', key: 'processedDate', direction: 'asc' },
        { label: 'Amount (High to Low)', key: 'advanceAmount', direction: 'desc' },
        { label: 'Amount (Low to High)', key: 'advanceAmount', direction: 'asc' },
        { label: 'Name (A-Z)', key: 'staffName', direction: 'asc' },
        { label: 'Name (Z-A)', key: 'staffName', direction: 'desc' },
    ];

    const handleSortChange = (option) => {
        setSortConfig({ key: option.key, direction: option.direction });
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-full md:w-auto px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-900 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-700 transition duration-150"
            >
                <SortAsc className="mr-2 w-4 h-4" /> 
                Sort by {sortConfig.key.replace(/([A-Z])/g, ' $1').toLowerCase()} ({sortConfig.direction === 'asc' ? '↑' : '↓'})
            </button>
            {showDropdown && (
                <ul className="absolute right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10 w-48">
                    {sortOptions.map(option => (
                        <li
                            key={`${option.key}-${option.direction}`}
                            onClick={() => handleSortChange(option)}
                            className="p-3 text-gray-200 hover:bg-blue-600/50 cursor-pointer transition duration-150"
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FinanceSortDropdown;