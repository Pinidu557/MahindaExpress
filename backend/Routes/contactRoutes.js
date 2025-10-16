import express from "express";
import contactUs, { getContactMessages } from "../controllers/contacsController.js";

const contactRouter = express.Router();

contactRouter.post("/contactus", contactUs);
contactRouter.get("/", getContactMessages);

export default contactRouter;
