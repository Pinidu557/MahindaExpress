const express = require("express");
const router = express.Router();
const {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeControllers");

router.post("/", createRoute);
router.get("/", getAllRoutes);
router.get("/:id", getRouteById);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);

module.exports = router;
