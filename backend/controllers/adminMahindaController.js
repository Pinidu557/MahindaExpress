import AdminMahinda from "../models/adminMahinda.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  // Check if admin exists
  const admin = await AdminMahinda.findOne({ email }).select("+password");

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if account is locked
  if (admin.isLocked) {
    return res.status(423).json({
      success: false,
      message: "Account temporarily locked due to too many failed login attempts",
    });
  }

  // Check password
  const isPasswordMatch = await admin.comparePassword(password);

  if (!isPasswordMatch) {
    // Increment login attempts
    await admin.incLoginAttempts();
    
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();

  // Generate token
  const token = generateToken(admin._id);

  // Remove password from response
  const adminData = {
    _id: admin._id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isActive: admin.isActive,
    lastLogin: admin.lastLogin,
  };

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    admin: adminData,
  });
});

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await AdminMahinda.findById(req.admin._id).select("-password");

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  res.status(200).json({
    success: true,
    admin,
  });
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  const admin = await AdminMahinda.findById(req.admin._id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  // Update fields
  if (name) admin.name = name;
  if (email) admin.email = email;

  await admin.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    admin: {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
    },
  });
});

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long",
    });
  }

  const admin = await AdminMahinda.findById(req.admin._id).select("+password");

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  // Check current password
  const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private
export const logoutAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// @desc    Create default admin (for initial setup)
// @route   POST /api/admin/create-default
// @access  Public (should be removed in production)
export const createDefaultAdmin = asyncHandler(async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await AdminMahinda.findOne({ email: "adminmahinda@gmail.com" });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Default admin already exists",
      });
    }

    // Create default admin
    const admin = new AdminMahinda({
      email: "adminmahinda@gmail.com",
      password: "mahinda",
      name: "Admin Mahinda",
      role: "super_admin",
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Default admin created successfully",
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating default admin",
      error: error.message,
    });
  }
});
