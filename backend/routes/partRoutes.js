import express from "express";
import {
  createPart,
  listParts,
  getPart,
  updatePart,
  deletePart,
  inventoryReport
} from "../controllers/partController.js";

const router = express.Router();

router.post("/", createPart);
router.get("/", listParts);
router.get("/report", inventoryReport);
router.get("/:id", getPart);
router.put("/:id", updatePart);
router.delete("/:id", deletePart);

export default router;
