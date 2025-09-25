import userModel from "../models/userModel.js";

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      userData: {
        _id: user._id, // Add the user ID
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        isLoggedIn: user.isLoggedIn,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstname, lastname } = req.body;

    console.log("Updating profile for user:", userId);
    console.log("Update data:", { firstname, lastname });

    if (!firstname || !lastname) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user details
    user.firstName = firstname;
    user.lastName = lastname;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      userData: {
        _id: user._id,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        isLoggedIn: user.isLoggedIn,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile: " + error.message,
    });
  }
};
