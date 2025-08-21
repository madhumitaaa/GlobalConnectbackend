// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Simple auth middleware
const auth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// CRUD + Actions
router.post('/', auth, jobController.createJob);         // Create job
router.get('/', jobController.getAllJobs);               // Get all jobs
router.get('/search', jobController.searchJobs);         // 🔥 Put search BEFORE :id
router.get('/:id', jobController.getJob);                // Get job detail
router.post('/:id/apply', auth, jobController.applyJob); // Apply to job
router.post('/:id/save', auth, jobController.toggleSaveJob); // Save/unsave

module.exports = router;
