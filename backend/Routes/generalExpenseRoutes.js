// backend/routes/generalExpenseRoutes.js
import express from 'express';
import { getUniqueCategories } from '../controllers/generalExpenseController.js';

const router = express.Router();

// GET /api/general-expenses/categories
router.get('/categories', getUniqueCategories);

export default router;