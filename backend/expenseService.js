import mongoose from "mongoose";

// --- IMPORTANT: Adjust these paths to correctly point to your model files ---
import Part from "./models/part.js"; // Placeholder path
import Fuel from "./models/fuel.js"; // Placeholder path
import Maintenance from "./models/maintenance.js"; // Placeholder path
import Salary from "./models/Salary.js"; // Placeholder path
// --------------------------------------------------------------------------


/**
 * Converts the target month and year into the string format used by the Salary schema ("Month Year").
 * Example: (10, 2025) -> "October 2025"
 * @param {number} month - The month (1-12).
 * @param {number} year - The year.
 * @returns {string} The formatted monthYear string.
 */
const getSalaryMonthYearString = (month, year) => {
  // Use month - 1 because Date constructor uses 0-indexed months
  const date = new Date(year, month - 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};


/**
 * Calculates the total operational expenses (Salaries + Maintenance + Parts + Fuel)
 * for a specific month and year using multiple aggregation pipelines.
 *
 * @param {number} targetMonth - The month to filter by (1 = Jan, 12 = Dec).
 * @param {number} targetYear - The year to filter by (e.g., 2024).
 * @returns {Promise<number>} The total calculated expenses sum.
 */
async function calculateMonthlyExpenses(targetMonth, targetYear) {
  // Date range for models using Date objects (Fuel and Maintenance)
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 1);
  // String for the Salary model
  const salaryMonthYear = getSalaryMonthYearString(targetMonth, targetYear);

  let totalExpenses = 0;

  try {
    // ----------------------------------------------------------------------
    // 1. Calculate SALARY Cost
    // ----------------------------------------------------------------------
    const salaryResult = await Salary.aggregate([
      {
        $match: {
          monthYear: salaryMonthYear,
          status: { $in: ['Calculated', 'Paid'] } // Only count salaries that have actually been paid
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotal: { $sum: "$netSalary" }, // Sum the net salary paid out
        },
      },
    ]);
    const salaryCost = salaryResult.length > 0 ? salaryResult[0].monthlyTotal : 0;
    
    // ----------------------------------------------------------------------
    // 2. Calculate FUEL Cost
    // ----------------------------------------------------------------------
    const fuelResult = await Fuel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }, // Filter by the transaction date
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotal: { $sum: "$totalCost" }, // Sum the total cost of fuel
        },
      },
    ]);
    const fuelCost = fuelResult.length > 0 ? fuelResult[0].monthlyTotal : 0;

    // ----------------------------------------------------------------------
    // 3. Calculate MAINTENANCE (Service Cost + Parts Cost)
    // ----------------------------------------------------------------------
    // This is complex as it requires calculating the cost of parts used during service
    const maintenanceResult = await Maintenance.aggregate([
      {
        $match: {
          serviceDate: { $gte: startDate, $lt: endDate },
          status: "completed", // Only count maintenance that is completed
        },
      },
      // Deconstruct partsUsed to perform lookups and calculations
      { $unwind: { path: "$partsUsed", preserveNullAndEmptyArrays: true } },
      // Look up the Part document to get the base cost
      {
        $lookup: {
          from: Part.collection.name, // Use the actual collection name for 'Part'
          localField: "partsUsed.part",
          foreignField: "_id",
          as: "partDetails",
        },
      },
      // $unwind the part details (safe because preserveNullAndEmptyArrays was used above)
      { $unwind: { path: "$partDetails", preserveNullAndEmptyArrays: true } },
      // Calculate the cost of the parts used in this specific maintenance item
      {
        $addFields: {
          partExpense: { $multiply: ["$partsUsed.qty", "$partDetails.cost"] },
          // Ensure null part details don't break the sum, treat null/undefined cost as 0
          calculatedPartCost: { $ifNull: ["$partExpense", 0] }, 
        },
      },
      // Regroup by the original maintenance record (_id)
      {
        $group: {
          _id: "$_id",
          serviceCost: { $first: "$serviceCost" }, // Keep the labor/service cost
          totalPartsCost: { $sum: "$calculatedPartCost" }, // Sum up all part costs for this service
        },
      },
      // Calculate the total expense for this single maintenance record
      {
        $addFields: {
          totalExpense: { $sum: ["$serviceCost", "$totalPartsCost"] },
        },
      },
      // Final grouping to sum all maintenance expenses for the month
      {
        $group: {
          _id: null,
          monthlyTotal: { $sum: "$totalExpense" },
        },
      },
    ]);
    const maintenanceAndPartsCost = maintenanceResult.length > 0 ? maintenanceResult[0].monthlyTotal : 0;

    // ----------------------------------------------------------------------
    // 4. Final Total
    // ----------------------------------------------------------------------
    totalExpenses = salaryCost + fuelCost + maintenanceAndPartsCost;

  } catch (error) {
    console.error("Error calculating monthly expenses:", error);
    totalExpenses = 0;
  }

  // Return the combined total
  return totalExpenses;
}

export { calculateMonthlyExpenses };
