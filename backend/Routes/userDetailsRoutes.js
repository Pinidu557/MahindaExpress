import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserDetails, updateProfile } from "../controllers/userDetails.js";

const userDetailsRouter = express.Router();

userDetailsRouter.get("/data", userAuth, getUserDetails);
userDetailsRouter.put("/profile", userAuth, updateProfile);

export default userDetailsRouter;
