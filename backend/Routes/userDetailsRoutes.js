import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserDetails, updateProfile } from "../controllers/userDetails.js";
import { deleteUser } from "../controllers/userController.js";

const userDetailsRouter = express.Router();

userDetailsRouter.get("/data", userAuth, getUserDetails);
userDetailsRouter.put("/profile", userAuth, updateProfile);
userDetailsRouter.delete("/:id", userAuth, deleteUser);

export default userDetailsRouter;
