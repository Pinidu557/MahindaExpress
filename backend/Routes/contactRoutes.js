import express from "express";
import contactUs from "../controllers/contacsController.js";

const contactRouter = express.Router();

contactRouter.post("/contactus", contactUs);

export default contactRouter;
