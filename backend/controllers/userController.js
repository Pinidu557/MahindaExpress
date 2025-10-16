import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import userAuth from "../middleware/userAuth.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplate.js";

export const register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  // Validation for name fields - no numbers allowed
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(firstname)) {
    return res.json({
      success: false,
      message: "First name should contain only letters",
    });
  }

  if (!nameRegex.test(lastname)) {
    return res.json({
      success: false,
      message: "Last name should contain only letters",
    });
  }

  // Email validation - must contain @ sign
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  // Password validation - minimum 8 characters and must include numbers
  if (password.length < 8) {
    return res.json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  const passwordHasNumber = /\d/.test(password);
  if (!passwordHasNumber) {
    return res.json({
      success: false,
      message: "Password must contain at least one number",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists with this email",
      });
    }
    const hasedPassword = await bycrypt.hash(password, 10);

    const newUser = new userModel({
      firstName: firstname,
      lastName: lastname,
      email: email,
      password: hasedPassword,
    });
    newUser.isLoggedIn = true;
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //sending welcome email
    const mailOptions = {
      from: "piniduransika961@gmail.com",
      to: email,
      subject: "Welcome to Mahinda Express",
      text: `Welcome to Mahinda Express Website. Your account has been created with email id: ${email}`,
      // html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
      //   "{{email}}",
      //   user.email
      // ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "User Successfully Registered" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }

  // Email validation - must contain @ sign and be in proper format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist with this email",
      });
    }

    const isPasswordValid = await bycrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.isLoggedIn = true;
    await user.save();

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Get user ID from token to update isLoggedIn status
    const { token } = req.cookies;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          // Update user's isLoggedIn status
          await userModel.findByIdAndUpdate(decoded.id, { isLoggedIn: false });
        }
      } catch (error) {
        // Token verification error - just continue with logout
        console.error("Token verification error during logout:", error.message);
      }
    }

    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res.json({ success: true, message: "Account Already Verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Accont Verification OTP",
      // text: `Your Otp is ${otp}, Please Enter this otp to verify your account`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "Otp Sent Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  // Check if required fields are provided
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" }); // Fixed success:true to success:false for error case
  }

  // Validate OTP format - must be a 6-digit number
  const otpRegex = /^[0-9]{6}$/;
  if (!otpRegex.test(otp)) {
    return res.json({
      success: false,
      message: "OTP must be a 6-digit number",
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid Otp" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Otp is expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//check if user authenticated
export const isAuthenticated = async (req, res) => {
  try {
    // If we got here, userAuth middleware has already verified the token
    // and set req.userId, so we know the user is authenticated
    return res.json({
      success: true,
      message: "User is authenticated",
      isAuthenticated: true, // Add this explicit flag
      userId: req.userId, // Include user ID in response
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      isAuthenticated: false, // Add this explicit flag
    });
  }
};

//send reset otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      // text: `Your Otp is ${otp}, Please Enter this otp to reset your password`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "Otp Sent Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid Otp" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Otp is expired" });
    }
    if (newPassword != confirmPassword) {
      return res.json({ success: false, message: "Re enter confirm password" });
    }

    const hashedPassword = await bycrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get all users (passengers) with pagination
export const getAllUsers = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total number of users
    const totalUsers = await userModel.countDocuments();

    // Find users with pagination and exclude sensitive information
    const users = await userModel
      .find(
        {},
        {
          password: 0,
          verifyOtp: 0,
          resetOtp: 0,
          verifyOtpExpireAt: 0,
          resetOtpExpireAt: 0,
        }
      )
      .sort({ createdAt: -1 }) // Sort by registration date, newest first
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      users,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user
    await userModel.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
