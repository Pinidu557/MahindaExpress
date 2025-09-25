import express from "express";
import {
  createFuel,
  listFuel,
  updateFuel,
  deleteFuel,
  fuelReport
} from "../controllers/fuelController.js";

const router = express.Router();

router.post("/", createFuel);
router.get("/", listFuel);
router.get("/report", fuelReport);
router.put("/:id", updateFuel);
router.delete("/:id", deleteFuel);

export default router;
