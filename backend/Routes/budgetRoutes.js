// backend/routes/budgetRoutes.js
import express from 'express';
import {
    getBudgetsAndActuals,
    setBudget,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController.js';

const router = express.Router();

// GET /api/budgets?monthYear=October 2025
router.get('/', getBudgetsAndActuals);

// POST /api/budgets (Create a new budget or update an existing one)
router.post('/', setBudget);

// PUT /api/budgets/:id (Update is handled by POST in this rolling budget model, 
// but we keep PUT/DELETE for clarity if you switch to monthly budgets)
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id
router.delete('/:id', deleteBudget);


export default router;