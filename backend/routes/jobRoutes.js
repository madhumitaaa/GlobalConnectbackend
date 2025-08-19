// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// If you have an auth middleware, insert it: e.g., require('../middleware/auth')
const auth = (req, res, next) => { 
  // placeholder - replace with your real middleware
  if (req.user) return next();
  // If token-based, decode and attach req.user
  next();
};

router.post('/', auth, jobController.createJob);              // create job (recruiter)
router.get('/:id', jobController.getJob);                     // get job detail
router.get('/search', jobController.searchJobs);              // search endpoint (q, location, skills, page, limit)
router.post('/:id/apply', auth, jobController.applyJob);      // apply
router.post('/:id/save', auth, jobController.toggleSaveJob);  // toggle save

module.exports = router;
