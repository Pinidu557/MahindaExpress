import { getTotalActualExpenses } from "../services/expenseAggregator.js";
import { getTotalIncome } from "../services/bookingService.js";

export const getFinanceDashboardData = async (req, res) => {
  try {
    // ✅ Get separate month and year values from query
    const { month, year } = req.query;

    // ✅ Validate them
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    // ✅ Convert to numbers
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // ✅ Calculate revenue
    const revenue = await getTotalIncome(monthInt, yearInt);
    
    // --- FIX 1: Retrieve total expenses AND the breakdown array ---
    const { totalExpenses, expenseBreakdown } = await getTotalActualExpenses(monthInt, yearInt);
    
    // --- FIX 2: Use the retrieved totalExpenses ---
    const netIncome = revenue - totalExpenses;

    // --- FIX 3: Remove dummy data; use the actual breakdown ---
    // The expenseBreakdown array now contains the actual spending per category 
    // in the format { name, value, color } which the Pie Chart expects.

    // ✅ Send data back to frontend
    res.status(200).json({
      revenue,
      expenses: totalExpenses, // Use the actual calculated total
      netIncome,
      expenseBreakdown, // Use the actual breakdown
    });
  } catch (error) {
    console.error("Finance Dashboard Error:", error);
    res.status(500).json({
      error: "Internal Server Error while calculating finance data.",
      details: error.message,
    });
  }
};
/*import { getTotalActualExpenses } from "../services/expenseAggregator.js";
import { getTotalIncome } from "../services/bookingService.js";

// import { calculateMonthlyIncome } from "../services/bookingService.js";
// import { calculateMonthlyExpenses } from "../services/expenseService.js";

export const getFinanceDashboardData = async (req, res) => {
  try {
    // ✅ Get separate month and year values from query
    const { month, year } = req.query;

    // ✅ Validate them
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    // ✅ Convert to numbers
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // ✅ Calculate revenue & expenses
    const revenue = await getTotalIncome(monthInt, yearInt);
    const expenses = await getTotalActualExpenses(monthInt, yearInt);
    const netIncome = revenue - expenses;

    // ✅ Example breakdown data (you can customize this)
    const expenseBreakdown = [
      { name: "Fuel", value: expenses * 0.3, color: "#FF6B6B" },
      { name: "Maintenance", value: expenses * 0.4, color: "#FFD93D" },
      { name: "Salaries", value: expenses * 0.2, color: "#6BCB77" },
      { name: "Other", value: expenses * 0.1, color: "#4D96FF" },
    ];

    // ✅ Send data back to frontend
    res.status(200).json({
      revenue,
      expenses,
      netIncome,
      expenseBreakdown,
    });
  } catch (error) {
    console.error("Finance Dashboard Error:", error);
    res.status(500).json({
      error: "Internal Server Error while calculating finance data.",
      details: error.message,
    });
  }
};*/






// // NOTE: This file assumes an Express/Node.js backend environment.
// // Services are assumed to be peers to the Controllers folder (i.e., in the 'backend' folder).
// import * as bookingService from '../bookingService.js';
// import * as expenseService from '../expenseService.js'; 

// /**
//  * Controller function for GET /api/dashboard/finance
//  * Calculates and returns financial metrics for a given month/year.
//  * * @param {object} req - Express request object (with month/year in query)
//  * @param {object} res - Express response object
//  */
// export const getFinanceDashboardData = async (req, res) => {
//     try {
//         const { month, year } = req.query;

//         // Basic validation
//         if (!month || !year) {
//             return res.status(400).json({ 
//                 error: 'Month and year query parameters are required.' 
//             });
//         }
        
//         const monthInt = parseInt(month, 10);
//         const yearInt = parseInt(year, 10);

//         // 1. Calculate Total Revenue (using your booking service)
//         // Ensure your calculateMonthlyRevenue function is implemented in bookingService.js
//         const revenue = await bookingService.calculateMonthlyRevenue(monthInt, yearInt); 

//         // 2. Calculate Total Expenses (using your expense service)
//         // Ensure your getMonthlyExpenses function is implemented in expenseService.js
//         const allExpenses = await expenseService.getMonthlyExpenses(monthInt, yearInt);
//         const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

//         // 3. Breakdown Expenses by category
//         const expenseCategories = {
//             Salaries: 0,
//             Fuel: 0,
//             'Maintenance & Parts': 0,
//             Other: 0 // Catch-all for expenses without a recognized category
//         };

//         allExpenses.forEach(exp => {
//             // Use 'category' from the expense data, falling back to 'Other'
//             const category = exp.category || 'Other'; 
//             if (expenseCategories.hasOwnProperty(category)) {
//                 expenseCategories[category] += exp.amount;
//             } else {
//                 expenseCategories['Other'] += exp.amount;
//             }
//         });
        
//         // 4. Construct the response payload (must match the frontend's expected format)
//         const responseData = {
//             revenue: revenue || 0,
//             expenses: totalExpenses,
//             netIncome: (revenue || 0) - totalExpenses,
//             expenseBreakdown: [
//                 // Frontend uses these specific colors:
//                 { name: 'Salaries', value: expenseCategories.Salaries, color: '#4CAF50' },
//                 { name: 'Fuel', value: expenseCategories.Fuel, color: '#FFC107' },
//                 { name: 'Maintenance & Parts', value: expenseCategories['Maintenance & Parts'], color: '#2196F3' },
//                 // Only include 'Other' if it has a non-zero value
//                 ...(expenseCategories.Other > 0 ? [{ name: 'Other', value: expenseCategories.Other, color: '#9CA3AF' }] : []),
//             ],
//         };

//         // 5. Send the successful JSON response
//         res.json(responseData);

//     } catch (error) {
//         console.error('Error in Finance Dashboard Controller:', error);
//         res.status(500).json({ 
//             error: 'Internal Server Error while calculating finance data.',
//             details: error.message 
//         });
//     }
// };





// // import { calculateMonthlyIncome } from '../bookingService.js';
// // import { calculateMonthlyExpenses } from '../expenseService.js';
// // // Assuming you export the expense components (Salary, Fuel, Maint. costs)
// // // OR, you modify calculateMonthlyExpenses to return the breakdown.

// // // --- OPTION A: If calculateMonthlyExpenses only returns the total ---
// // // For the Pie Chart, you need the individual expense categories.
// // // You must adjust expenseService.js to return an object with the breakdown, not just the total.
// // // Let's assume you modified calculateMonthlyExpenses to return:
// // // { totalExpenses, salaryCost, fuelCost, maintenanceAndPartsCost }

// // const getFinanceDashboardData = async (req, res) => {
// //   const { month, year } = req.query;

// //   // Validate inputs
// //   if (!month || !year) {
// //     return res.status(400).json({ message: "Month and year are required query parameters." });
// //   }

// //   const targetMonth = parseInt(month);
// //   const targetYear = parseInt(year);

// //   try {
// //     // 1. Get Income
// //     const revenue = await calculateMonthlyIncome(targetMonth, targetYear);
    
// //     // 2. Get Expenses (Assuming the service is modified to return a detailed object)
// //     // NOTE: If your service only returns the total, you'll need separate calls for breakdown.
    
// //     // --- TEMPORARY MOCK FOR BREAKDOWN (Replace with actual service call if needed) ---
// //     // If you haven't changed expenseService.js to return breakdown, you'll need to do it.
// //     const expensesBreakdown = await calculateMonthlyExpensesBreakdown(targetMonth, targetYear); // Placeholder for a new detailed service call
    
// //     const { totalExpenses, salaryCost, fuelCost, maintenanceAndPartsCost } = expensesBreakdown; // Assume this structure

// //     // 3. Calculate Net Income
// //     const netIncome = revenue - totalExpenses;

// //     // 4. Format the expense breakdown for the Pie Chart
// //     const expenseBreakdown = [
// //       { name: 'Salaries', value: salaryCost, color: '#4CAF50' },
// //       { name: 'Fuel', value: fuelCost, color: '#FFC107' },
// //       { name: 'Maintenance & Parts', value: maintenanceAndPartsCost, color: '#2196F3' },
// //     ];

// //     res.status(200).json({
// //       revenue,
// //       expenses: totalExpenses,
// //       netIncome,
// //       expenseBreakdown,
// //     });

// //   } catch (error) {
// //     console.error("Dashboard data aggregation failed:", error);
// //     res.status(500).json({ message: "Internal server error during data retrieval." });
// //   }
// // };

// // export { getFinanceDashboardData };