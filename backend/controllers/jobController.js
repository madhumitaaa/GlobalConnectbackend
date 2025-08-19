// controllers/jobController.js
const Job = require('../models/Job');
const mongoose = require('mongoose');

async function createJob(req, res) {
  try {
    const data = req.body;
    data.skills = Array.isArray(data.skills) ? data.skills.map(s => s.trim().toLowerCase()) : (data.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const job = new Job({ ...data, postedBy: req.user?._id });
    await job.save();
    return res.status(201).json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
}

async function getJob(req, res) {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    // increment view asynchronously (best-effort)
    Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } }).catch(() => {});
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching job', error: err.message });
  }
}

async function searchJobs(req, res) {
  try {
    const q = req.query.q || '';               // keyword search
    const location = req.query.location;
    const remote = req.query.remote;           // 'true' or 'false'
    const skills = req.query.skills;           // comma-separated or array
    const seniority = req.query.seniority;
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;

    let filter = { isActive: true };

    if (location) filter.location = new RegExp(location, 'i');
    if (remote === 'true' || remote === 'false') filter.remote = remote === 'true';
    if (seniority) filter.seniority = seniority;

    if (skills) {
      const skillsArr = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim().toLowerCase());
      filter.skills = { $all: skillsArr };
    }

    // If keyword given use text search with score
    let query;
    if (q) {
      query = Job.find({ $text: { $search: q }, ...filter }, { score: { $meta: "textScore" } })
                 .sort({ score: { $meta: "textScore" }, createdAt: -1 })
                 .skip(skip).limit(limit);
    } else {
      // No keyword, apply basic filters + sort by createdAt
      query = Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    const [jobs, total] = await Promise.all([
      query.exec(),
      Job.countDocuments(filter)
    ]);

    // Optionally compute a simple matchScore for each job if q provided
    const enhanced = jobs.map(j => {
      const jobObj = j.toObject();
      jobObj.matchScore = q ? (j.score || 0) : null;
      return jobObj;
    });

    return res.json({ results: enhanced, page, limit, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Search error', error: err.message });
  }
}

async function applyJob(req, res) {
  try {
    const jobId = req.params.id;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Login required to apply' });

    // Minimal example: store apply action in job.meta.appliedUsers (or better: create Applications collection)
    await Job.findByIdAndUpdate(jobId, { $inc: { applies: 1 }, $addToSet: { 'meta.appliedUsers': mongoose.Types.ObjectId(userId) }});
    return res.json({ message: 'Applied successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Apply failed', error: err.message });
  }
}

async function toggleSaveJob(req, res) {
  try {
    const jobId = req.params.id;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Login required' });

    // Assume User model has savedJobs array — else implement user-based saved list
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const has = (user.savedJobs || []).some(j => j.toString() === jobId);
    if (has) {
      user.savedJobs = user.savedJobs.filter(j => j.toString() !== jobId);
      await user.save();
      await Job.findByIdAndUpdate(jobId, { $inc: { saves: -1 } }).catch(()=>{});
      return res.json({ saved: false });
    } else {
      user.savedJobs = user.savedJobs || [];
      user.savedJobs.push(jobId);
      await user.save();
      await Job.findByIdAndUpdate(jobId, { $inc: { saves: 1 } }).catch(()=>{});
      return res.json({ saved: true });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Save fail', error: err.message });
  }
}

module.exports = {
  createJob,
  getJob,
  searchJobs,
  applyJob,
  toggleSaveJob
};
