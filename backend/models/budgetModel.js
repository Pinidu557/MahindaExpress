// backend/models/budgetModel.js
import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    // The name of the category (e.g., 'Fuel', 'Maintenance', 'Rent')
    budgetCategory: {
        type: String,
        required: [true, 'Budget category is required'],
        trim: true,
    },
    // The target budget amount
    targetAmount: {
        type: Number,
        required: [true, 'Target amount is required'],
        min: 0.01,
    },
    // The name of the MongoDB collection (source) for actual spending
    sourceType: {
        type: String,
        required: true,
        enum: ['fuels', 'maintenances', 'parts', 'salaries', 'generalExpenses'], // Ensure these match your collection names
    },
    // The field within the source collection to aggregate (e.g., 'totalCost', 'serviceCost', 'salaryDetails.netSalary', 'amount')
    transactionField: {
        type: String,
        required: true,
    },
    // The date this budget entry was created/last updated (used to determine the 'active' budget)
    effectiveDate: {
        type: Date,
        default: Date.now,
        
    },
}, { timestamps: true });

// Indexing for faster lookups on category and sorting by date
budgetSchema.index({ budgetCategory: 1, effectiveDate: -1 });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;