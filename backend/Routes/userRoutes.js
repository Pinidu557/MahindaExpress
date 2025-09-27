import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
userRouter.post("/verify-account", userAuth, verifyEmail);
userRouter.get("/is-auth", userAuth, isAuthenticated);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/all-users", userAuth, getAllUsers); // Add this new route to get all users
userRouter.delete("/:id", userAuth, deleteUser); // Add delete user route

export default userRouter;
