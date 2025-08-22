import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserDetails } from "../controllers/userDetails.js";

const userDetailsRouter = express.Router();

userDetailsRouter.get("/data", userAuth, getUserDetails);

export default userDetailsRouter;
