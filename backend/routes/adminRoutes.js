import express from "express";
import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(400)
        .json({ success: false, message: "Admin not found" });

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, "yourSecretKey", {
      expiresIn: "1d",
    });
    res.json({ success: true, token, admin: { email: admin.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
