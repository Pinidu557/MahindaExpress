import mongoose from 'mongoose';

const generalExpenseSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', 
        },
        // This is the field used for filtering and for the budget category name
        category: { 
            type: String,
            required: [true, 'Please add an expense category'],
            trim: true,
        },
        description: {
            type: String,
        },
        // This is the cost field used for aggregation
        amount: { 
            type: Number,
            required: [true, 'Please add the expense amount'],
            default: 0,
        },
        // This date is CRITICAL for monthly aggregation
        date: {
            type: Date,
            required: [true, 'Please add the transaction date'],
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const GeneralExpense = mongoose.model('GeneralExpense', generalExpenseSchema);

export default GeneralExpense;
