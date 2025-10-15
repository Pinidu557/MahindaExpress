import Budget from "../models/budgetModel.js";
import Maintenance from "../models/maintenance.js";
import Fuel from "../models/fuel.js";
import StaffSalary from "../models/Salary.js";
import Part from "../models/part.js";

// Map budget sourceType to actual Mongoose models and their amount fields
const ExpenseModels = {
  fuels: { model: Fuel, amountField: "totalCost", dateField: "date" },
  maintenances: { model: Maintenance, amountField: "serviceCost", dateField: "serviceDate", statusField: "status", statusValues: ["pending", "completed"] },
  parts: { model: Part, amountField: "cost", dateField: "updatedAt" },
  salaries: { model: StaffSalary, amountField: "netSalary", monthYearField: "monthYear", statusField: "status", statusValues: ["Calculated", "Paid"] },
};

// Colors for the Pie Chart (Must match the category name)
const CATEGORY_COLORS = {
    Fuel: '#EF4444',         // Red
    Maintenance: '#F59E0B',  // Amber
    Parts: '#3B82F6',        // Blue
    Salaries: '#10B981',     // Emerald
    // Add other colors here if you have more budget categories
    'Other': '#8B5CF6', 
};


export const getTotalActualExpenses = async (monthInt, yearInt) => {
  
    // --- START: Date setup using monthInt, yearInt ---
    // Note: The controller now passes month/year as integers, so we adjust date parsing here.
    const startOfMonth = new Date(yearInt, monthInt - 1, 1);
    const endOfMonth = new Date(yearInt, monthInt, 0, 23, 59, 59, 999);
    // --- END: Date setup ---

  // Get active budgets (latest per category)
  const activeBudgets = await Budget.aggregate([
    { $sort: { budgetCategory: 1, effectiveDate: -1 } },
    {
      $group: {
        _id: "$budgetCategory",
        targetAmount: { $first: "$targetAmount" },
        sourceType: { $first: "$sourceType" },
        transactionField: { $first: "$transactionField" },
        _idOriginal: { $first: "$_id" },
      },
    },
    {
      $project: {
        _id: "$_idOriginal",
        budgetCategory: "$_id",
        targetAmount: 1,
        sourceType: 1,
        transactionField: 1,
      },
    },
  ]);

  let totalExpenses = 0;
  // --- NEW: Array to store category breakdown ---
  let expenseBreakdown = []; 

  for (const budget of activeBudgets) {
    const mapping = ExpenseModels[budget.sourceType];
    if (!mapping) continue;

    const { model: Model, amountField, dateField, statusField, statusValues, monthYearField } = mapping;

    let matchConditions = {};

    if (budget.sourceType === "salaries") {
      // Salaries match by monthYear string & status
      const monthYearToMatch = startOfMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
      matchConditions[monthYearField] = monthYearToMatch;
      if (statusField && statusValues) matchConditions[statusField] = { $in: statusValues };
    } else {
      // Other expenses match by date range
      matchConditions[dateField] = { $gte: startOfMonth, $lte: endOfMonth };

      // Add status filter if defined
      if (statusField && statusValues) matchConditions[statusField] = { $in: statusValues };

      // For GeneralExpense, filter by category
      if (budget.sourceType === "generalExpenses") matchConditions["category"] = budget.budgetCategory;
      // Note: If Maintenance is budgeted by type, you may need to add that filter here too
      // if (budget.sourceType === "maintenances") matchConditions["serviceType"] = budget.budgetCategory; 
    }
    
    let spent = 0;
    try {
      const result = await Model.aggregate([
        { $match: matchConditions },
        { $group: { _id: null, totalSpent: { $sum: `$${budget.transactionField}` } } }, // Use budget.transactionField
      ]);
      spent = result[0]?.totalSpent || 0;
      totalExpenses += spent;
    } catch (err) {
      console.error(`Error aggregating ${budget.budgetCategory}:`, err.message);
    }
    
    // --- NEW: Add the category breakdown data ---
    expenseBreakdown.push({
        name: budget.budgetCategory, // Category name for the chart
        value: parseFloat(spent.toFixed(2)), // Actual spending
        color: CATEGORY_COLORS[budget.budgetCategory] || '#6B7280', // Default color if not found
    });
  }

  // --- RETURN BOTH THE TOTAL AND THE BREAKDOWN ---
  return {
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    expenseBreakdown: expenseBreakdown,
  };
};


// import Budget from "../models/budgetModel.js";
// import Maintenance from "../models/maintenance.js";
// import Fuel from "../models/fuel.js";
// import StaffSalary from "../models/Salary.js";
// import part from "../models/part.js";
// const ExpenseModels = {
//   generalExpenses: Fuel,       // or whichever model represents general expenses
//   salaries: StaffSalary,
//   maintenances: Maintenance,
//   parts: part, 
// }

// // ✅ Reuse budget logic to calculate total expenses for the finance dashboard
// export const getTotalActualExpenses = async (monthYear) => {
//   const dateObj = new Date(monthYear);
//   if (isNaN(dateObj)) throw new Error("Invalid monthYear format");

//   const year = dateObj.getFullYear();
//   const monthIndex = dateObj.getMonth();
//   const startOfMonth = new Date(year, monthIndex, 1);
//   const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

//   const activeBudgets = await Budget.aggregate([
//     { $sort: { budgetCategory: 1, effectiveDate: -1 } },
//     {
//       $group: {
//         _id: "$budgetCategory",
//         targetAmount: { $first: "$targetAmount" },
//         sourceType: { $first: "$sourceType" },
//         transactionField: { $first: "$transactionField" },
//         _idOriginal: { $first: "$_id" },
//       },
//     },
//     {
//       $project: {
//         _id: "$_idOriginal",
//         budgetCategory: "$_id",
//         targetAmount: 1,
//         sourceType: 1,
//         transactionField: 1,
//       },
//     },
//   ]);

//   let totalExpenses = 0;

//   for (const budget of activeBudgets) {
//     const Model = ExpenseModels[budget.sourceType];
//     if (!Model) continue;

//     const fieldPath = `$${budget.transactionField}`;
//     let matchConditions = {};
//     const monthYearToMatch = startOfMonth.toLocaleString("en-US", {
//       month: "long",
//       year: "numeric",
//     });

//     // 🔎 match conditions (copying your logic)
//     if (budget.sourceType === "generalExpenses") {
//       matchConditions = {
//         date: { $gte: startOfMonth, $lte: endOfMonth },
//         category: budget.budgetCategory,
//       };
//     } else if (budget.sourceType === "salaries") {
//       matchConditions = {
//         monthYear: monthYearToMatch,
//         status: { $in: ["Calculated", "Paid"] },
//       };
//     } else if (budget.sourceType === "maintenances") {
//       matchConditions = {
//         serviceDate: { $gte: startOfMonth, $lte: endOfMonth },
//         status: { $in: ["completed", "pending"] },
//       };
//     } else if (budget.sourceType === "parts") {
//       matchConditions = {
//         updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
//       };
//     } else {
//       matchConditions = {
//         date: { $gte: startOfMonth, $lte: endOfMonth },
//       };
//     }

//     // 💸 aggregate actual spent
//     try {
//       const result = await Model.aggregate([
//         { $match: matchConditions },
//         { $group: { _id: null, totalSpent: { $sum: fieldPath } } },
//       ]);
//       const spent = result[0]?.totalSpent || 0;
//       totalExpenses += spent;
//     } catch (err) {
//       console.error(`Error aggregating ${budget.budgetCategory}:`, err.message);
//     }
//   }

//   return parseFloat(totalExpenses.toFixed(2));
// };
