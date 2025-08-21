const express = require("express");
const router = express.Router();
const { 
  createJob, 
  getAllJobs, 
  getJobById, 
  applyJob, 
  saveJob 
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// Create job
router.post("/", protect, createJob);

// Get all jobs
router.get("/", getAllJobs);

// Get single job
router.get("/:id", getJobById);

// Apply for job
router.post("/:id/apply", protect, applyJob);

// Save/Unsave job
router.post("/:id/save", protect, saveJob);

module.exports = router;
