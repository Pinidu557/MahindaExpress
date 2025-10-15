// --- In Routes/expenseRoutes.js ---
import express from 'express';
// Assuming you move the controller function here eventually, 
// for now, let's import it from budgetController
import { getGeneralExpenseCategories } from '../controllers/budgetController.js'; 
import { adminAuth  } from '../middleware/adminAuth.js'; 

const router = express.Router();

// The path is just '/categories' because it will be mounted at /api/general-expenses
router.get('/categories', adminAuth , getGeneralExpenseCategories);

export default router;