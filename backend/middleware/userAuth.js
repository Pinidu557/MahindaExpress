import jwt from "jsonwebtoken";

import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized! Login Again" });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.userId = tokenDecode.id;

      // Get the user data and attach to request
      try {
        const user = await User.findById(tokenDecode.id);
        if (user) {
          req.user = user;
        }
      } catch (err) {
        console.error("Error fetching user data in middleware:", err);
      }
    } else {
      return res.json({
        success: false,
        message: "Not Authorized! Login Again",
      });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
