import React from "react";
import FinanceSidebar from "./FinanceSidebar"; // Import the sidebar we just created

// We need a wrapper component to ensure the content area is offset from the fixed sidebar
const FinanceLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* The sidebar is fixed and takes up 64 units (w-64)
        The main content needs a left margin to push it past the sidebar.
      */}
      
      {/* Fixed Sidebar Component */}
      <FinanceSidebar /> 
      
      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        {/* The ml-64 (margin-left: 16rem) compensates for the fixed w-64 sidebar */}
        {children}
      </main>
    </div>
  );
};

export default FinanceLayout;