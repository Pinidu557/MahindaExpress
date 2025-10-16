// backend/controllers/budgetController.js
import Budget from '../models/budgetModel.js';
import Fuel from '../models/fuel.js';
import Maintenance from '../models/maintenance.js';
import Part from '../models/part.js';
import Salary from '../models/Salary.js';
import GeneralExpense from '../models/generalExpenseModel.js';
import mongoose from 'mongoose';

// Map of collection names to their respective Mongoose Models
const ExpenseModels = {
    fuels: Fuel,
    maintenances: Maintenance,
    parts: Part,
    salaries: Salary,
    generalExpenses: GeneralExpense,
};

// Helper function to aggregate actual spending for a given collection and field
const aggregateActualSpending = async (sourceType, transactionField, startOfMonth, endOfMonth) => {
    const Model = ExpenseModels[sourceType];
    if (!Model) return 0;

    let matchConditions = {
        date: { $gte: startOfMonth, $lte: endOfMonth }
    };

    // Special handling for the Salary model if needed (using month/year fields)
    if (sourceType === 'salaries') {
        // NOTE: Frontend sends monthYear string (e.g., "October 2025"). We need to parse this.
        const monthYearStr = `${startOfMonth.toLocaleString('en-US', { month: 'long' })} ${startOfMonth.getFullYear()}`;
        const [month, year] = monthYearStr.split(' ');
        // 👇 FIX: Declare and calculate the monthYear string here.
        const monthYearToMatch = startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        matchConditions = {
            // month: month,
            // year: year
            monthYear: monthYearToMatch,
            status: { $in: ['Calculated', 'Paid'] }
        };
    }
    // For GeneralExpense, the filter by category (budgetCategory) is also needed
    // This is handled in the main controller loop, so we don't apply it here yet
    
    // Aggregation pipeline setup
    let aggregationPipeline = [
        { $match: matchConditions }
    ];

    // If GeneralExpense, we also need to group by category and match the budgetCategory
    // Since this helper is called for a single sourceType, we use it for general aggregation
    
    // Check if the transactionField is nested (e.g., 'salaryDetails.netSalary')
    const fieldPath = `$${transactionField}`;
    
    aggregationPipeline.push({
        $group: {
            _id: null,
            totalSpent: { $sum: fieldPath }
        }
    });

    const result = await Model.aggregate(aggregationPipeline);
    return result[0]?.totalSpent || 0;
};

// @desc    Get all active budgets for the current month and calculate actual spending
// @route   GET /api/budgets?monthYear=October 2025
// @access  Public (Adjust as needed)
export const getBudgetsAndActuals = async (req, res) => {
    try {
        const { monthYear } = req.query; // e.g., "October 2025"
        if (!monthYear) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // 1. Convert monthYear string to Date range (CRITICAL for aggregation)
        // Note: The frontend sends "Month Year", we convert it back to Date objects.
        const dateObj = new Date(monthYear);
        if (isNaN(dateObj)) {
             return res.status(400).json({ message: 'Invalid monthYear format' });
        }
        
        const year = dateObj.getFullYear();
        const monthIndex = dateObj.getMonth();
        
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999); // Last millisecond of the month

      

      
          // 2. Find the LATEST (Active) Budget for EACH category
        // Aggregate to find the most recent budget entry for each category
        const activeBudgets = await Budget.aggregate([
            { 
                $sort: { budgetCategory: 1, effectiveDate: -1 } 
            },
            { 
                $group: {
                    _id: "$budgetCategory",
                    // Keep the fields of the most recent document in the group
                    targetAmount: { $first: "$targetAmount" },
                    sourceType: { $first: "$sourceType" },
                    transactionField: { $first: "$transactionField" },
                    _idOriginal: { $first: "$_id" }, // We need the original MongoDB _id
                }
            },
            {
                $project: {
                    _id: "$_idOriginal",
                    budgetCategory: "$_id",
                    targetAmount: 1,
                    sourceType: 1,
                    transactionField: 1
                }
            }
        ]);
        
     /*   // 3. Calculate Actual Spending for the Current Month for each active budget
        const budgetsWithActuals = await Promise.all(activeBudgets.map(async (budget) => {
            let actualAmount;
            
            if (budget.sourceType === 'generalExpenses') {
                // Special handling for General Expenses: filter by category AND date range
                const fieldPath = `$${budget.transactionField}`;
                const result = await ExpenseModels.generalExpenses.aggregate([
                    { $match: { 
                        date: { $gte: startOfMonth, $lte: endOfMonth },
                        category: budget.budgetCategory // Filter by the specific category name
                    }},
                    { $group: {
                        _id: null,
                        totalSpent: { $sum: fieldPath }
                    }}
                ]);
                actualAmount = result[0]?.totalSpent || 0;
            } else if (budget.sourceType === 'salaries') {
                 // Special handling for Salaries: filter by month/year (as stored in Salary model)
                 const monthName = startOfMonth.toLocaleString('en-US', { month: 'long' });
                 const yearStr = String(year);
                 const fieldPath = `$${budget.transactionField}`;
                 
                 const result = await ExpenseModels.salaries.aggregate([
                    { $match: { 
                        month: monthName,
                        year: yearStr,
                        status: 'Paid' // Only include paid salaries
                    }},
                    { $group: {
                        _id: null,
                        totalSpent: { $sum: fieldPath }
                    }}
                ]);
                actualAmount = result[0]?.totalSpent || 0;

            } else {
                // General aggregation for all other models (Fuel, Maintenance, Parts)
                actualAmount = await aggregateActualSpending(
                    budget.sourceType, 
                    budget.transactionField, 
                    startOfMonth, 
                    endOfMonth
                );
            }
            
            return {
                ...budget,
                actualAmount: parseFloat(actualAmount.toFixed(2)),
            };
        }));

        res.status(200).json(budgetsWithActuals); */


        // 3. Calculate Actual Spending for the Current Month for each active budget
const budgetsWithActuals = await Promise.all(activeBudgets.map(async (budget) => {
    let actualAmount = 0; // Initialize actual amount
    let Model = ExpenseModels[budget.sourceType];

    // If no model is found, skip this budget item
    if (!Model) {
        console.warn(`No model found for sourceType: ${budget.sourceType}`);
        return { ...budget, actualAmount: 0 };
    }

    const fieldPath = `$${budget.transactionField}`;
    let matchConditions = {}; // Start with an empty match object
    let dateField = 'date';   // Assume 'date' by default

    // --- 3a. Set Specific Match Conditions Based on sourceType ---

    if (budget.sourceType === 'generalExpenses') {
        // General Expenses: Filter by category AND date range
        matchConditions = { 
            date: { $gte: startOfMonth, $lte: endOfMonth },
            category: budget.budgetCategory 
        };

    } else if (budget.sourceType === 'salaries') {
        // Salaries: Filter by month/year strings and status (Paid)
        const monthName = startOfMonth.toLocaleString('en-US', { month: 'long' });
        const yearStr = String(year);
        // 👇 FIX: Declare and calculate the monthYear string here.
        const monthYearToMatch = startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        matchConditions = { 
            // month: monthName,
            // year: yearStr,
            monthYear: monthYearToMatch,
            status: { $in: ['Calculated', 'Paid'] } // Only include paid salaries 
        };

    } else if (budget.sourceType === 'maintenances') {
        // Maintenance: Filter by serviceDate AND status
        dateField = 'serviceDate'; // Model field is 'serviceDate', not 'date'
        matchConditions = {
            [dateField]: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $in: ['completed', 'pending'] } // Include both for testing/flexibility
        };
        // CRITICAL: Ensure your 'transactionField' for Maintenance is 'serviceCost' (lowercase c if model uses it)

    } else if (budget.sourceType === 'parts') {
        // Parts: Filters by date. Use 'createdAt' if you don't have a specific date field.
        // Assuming the model uses 'createdAt' for date filtering.
        dateField = 'updatedAt'; 
        matchConditions = {
            [dateField]: { $gte: startOfMonth, $lte: endOfMonth }
        };
        // CRITICAL: Ensure your 'transactionField' for Parts is 'cost' (lowercase c)

    } else if (budget.sourceType === 'fuels') {
        // Fuels: Uses the default date field 'date'
        matchConditions = {
            date: { $gte: startOfMonth, $lte: endOfMonth }
        };
        // CRITICAL: Ensure your 'transactionField' for Fuels is 'totalCost'

    } else {
        // Fallback for any unexpected sourceType
        console.warn(`Unknown sourceType: ${budget.sourceType}`);
        return { ...budget, actualAmount: 0 };
    }
    
    // --- 3b. RUN AGGREGATION ---
    try {
        const result = await Model.aggregate([
            { $match: matchConditions },
            { $group: {
                _id: null,
                totalSpent: { $sum: fieldPath }
            }}
        ]);
        actualAmount = result[0]?.totalSpent || 0;
    } catch (aggError) {
         console.error(`Aggregation error for ${budget.budgetCategory} (${budget.sourceType}):`, aggError);
         // If there's an error (like a bad fieldPath), actualAmount remains 0
    }

    return {
        ...budget,
        actualAmount: parseFloat(actualAmount.toFixed(2)),
    };
}));

res.status(200).json(budgetsWithActuals);

    } catch (error) {
        console.error("Error in getBudgetsAndActuals:", error);
        res.status(500).json({ message: 'Server error during budget calculation' });
    }
}; 


// @desc    Set a new budget or update an existing one (Creates a new entry for rolling budget)
// @route   POST /api/budgets
// @access  Public (Adjust as needed)
export const setBudget = async (req, res) => {
    try {
        const { budgetCategory, targetAmount, sourceType, transactionField } = req.body;

        if (!budgetCategory || targetAmount === undefined || !sourceType || !transactionField) {
            return res.status(400).json({ message: 'Missing required budget fields' });
        }

        // Find the last existing budget for this category
        const existingBudget = await Budget.findOne({ budgetCategory }).sort({ effectiveDate: -1 });

        // If the new target amount is the same as the current active budget, we don't create a new entry
        if (existingBudget && existingBudget.targetAmount === targetAmount) {
            return res.status(200).json({ 
                message: 'Budget already set to this amount, no update needed.', 
                budget: existingBudget 
            });
        }
        
        // Always create a new entry for the rolling budget, which makes it the new "active" budget
        const newBudgetEntry = await Budget.create({
            budgetCategory,
            targetAmount,
            sourceType,
            transactionField,
            effectiveDate: new Date(), // Use current time as the effective date
        });

        res.status(201).json({ 
            message: 'Budget target saved/updated successfully.', 
            budget: newBudgetEntry 
        });

    } catch (error) {
        console.error("Error in setBudget:", error);
        // Handle MongoDB validation error (e.g., targetAmount min/required)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to set budget target' });
    }
};

// @desc    Update an existing budget (Handled by POST in this rolling budget model, but kept for ID-based delete)
// @route   PUT /api/budgets/:id
// @access  Public
export const updateBudget = async (req, res) => {
    // In a 'rolling budget' model, an 'update' is usually a new entry.
    // However, if the frontend sends an ID, they might be trying to update the most recent one.
    // For simplicity, we will redirect the logic to setBudget by category, but enforce it on the most recent entry if using PUT.
    // For this design, let's keep it simple: PUT with an ID should update the target amount of the most recent entry.
    
    const { id } = req.params;
    const { targetAmount } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid budget ID' });
    }
    
    try {
        const budgetToUpdate = await Budget.findById(id);

        if (!budgetToUpdate) {
            return res.status(404).json({ message: 'Budget entry not found' });
        }
        
        // Check if the budget being updated is actually the most recent one for its category
        // This is crucial for the rolling budget model
        const mostRecentBudget = await Budget.findOne({ budgetCategory: budgetToUpdate.budgetCategory })
            .sort({ effectiveDate: -1 })
            .limit(1);

        if (mostRecentBudget._id.toString() !== budgetToUpdate._id.toString()) {
            // If the user tries to update an old, non-active budget, treat it as a new budget entry
            // This ensures only the active budget is ever truly modified or replaced.
            return setBudget(req, res); // Call the POST handler to create a new rolling budget entry
        }
        
        // If it is the most recent (active) budget, update its amount (without creating a new entry)
        const updatedBudget = await Budget.findByIdAndUpdate(
            id,
            { targetAmount, effectiveDate: new Date() }, // Also update effectiveDate to make it current
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Active budget updated successfully.', budget: updatedBudget });

    } catch (error) {
        console.error("Error in updateBudget:", error);
        res.status(500).json({ message: 'Failed to update budget target' });
    }
};

// @desc    Delete a budget entry by ID
// @route   DELETE /api/budgets/:id
// @access  Public (Adjust as needed)
export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid budget ID' });
        }

        const deletedBudget = await Budget.findByIdAndDelete(id);

        if (!deletedBudget) {
            return res.status(404).json({ message: 'Budget entry not found' });
        }

        res.status(200).json({ 
            message: 'Budget entry deleted successfully.', 
            deletedId: id 
        });

    } catch (error) {
        console.error("Error in deleteBudget:", error);
        res.status(500).json({ message: 'Failed to delete budget' });
    }
};