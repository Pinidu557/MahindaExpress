import React from 'react';
import { Search } from 'lucide-react';

const FinanceSearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search by name, reason, etc..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 placeholder-gray-500" 
            />
        </div>
    );
};

export default FinanceSearchBar;