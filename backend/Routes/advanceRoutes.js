import express from "express";
import { getAdvances, createAdvance, updateAdvance, deleteAdvance } from "../controllers/advanceController.js";

const router = express.Router();

// GET /api/advances
router.get('/', getAdvances);

// POST /api/advances
router.post('/', createAdvance);

// PUT /api/advances/:id
router.put('/:id', updateAdvance);

// DELETE /api/advances/:id
router.delete('/:id', deleteAdvance);

export default router;