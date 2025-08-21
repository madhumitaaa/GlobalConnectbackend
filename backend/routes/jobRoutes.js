const express = require("express");
const router = express.Router();
const { 
  createJob, 
  getJob,       // ✅ fixed name
  searchJobs,   // ✅ fixed name
  applyJob, 
  toggleSaveJob // ✅ fixed name
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// Create job
router.post("/", protect, createJob);

// Get all jobs (search/filter)
router.get("/", searchJobs);

// Get single job by id
router.get("/:id", getJob);

// Apply for job
router.post("/:id/apply", protect, applyJob);

// Save/Unsave job
router.post("/:id/save", protect, toggleSaveJob);

module.exports = router;
