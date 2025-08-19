const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require('../middleware/multer');
const { protect } = require('../middleware/authMiddleware');

// Helper: generate token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ======================== REGISTER ========================
router.post("/register", upload.single("profilePic"), async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const profilePicPath = req.file ? req.file.path : "";

    const user = await User.create({
      name,
      email,
      password: hashed,
      profilePic: profilePicPath,
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  }
});

// ======================== LOGIN ========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    if (!user.password) return res.status(400).json({ message: "Please login via Google OAuth" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// ======================== GET LOGGED IN USER ========================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// ======================== UPDATE PROFILE ========================
router.put("/me", protect, upload.single("profilePic"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    if (typeof updateData.skills === "string") {
      updateData.skills = updateData.skills.split(",").map(skill => skill.trim());
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// ======================== SEARCH USERS ========================
router.get("/search", protect, async (req, res) => {
  const { name } = req.query;
  try {
    const users = await User.find({
      name: { $regex: name, $options: "i" }
    }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;
