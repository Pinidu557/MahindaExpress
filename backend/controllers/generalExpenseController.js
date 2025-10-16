// backend/controllers/generalExpenseController.js
import GeneralExpense from '../models/generalExpenseModel.js';

// @desc    Get all unique general expense categories
// @route   GET /api/general-expenses/categories
// @access  Public (Adjust as needed)
export const getUniqueCategories = async (req, res) => {
    try {
        const categories = await GeneralExpense.distinct('category');
        
        // Ensure only non-empty strings are returned
        const filteredCategories = categories.filter(c => c && c.trim().length > 0);
        
        res.status(200).json(filteredCategories);
    } catch (error) {
        console.error("Error fetching unique categories:", error);
        res.status(500).json({ message: 'Failed to fetch general expense categories' });
    }
};