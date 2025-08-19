// models/User.js

const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  from: Date,
  to: Date
}, { _id: false });

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  from: Date,
  to: Date
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // not required for OAuth users
  bio: { type: String, default: '' },

  profilePic: { type: String, default: '' },
  bannerPic: { type: String, default: '' },

  experience: [experienceSchema],
  education: [educationSchema],
  skills: [String],

  // If you keep connection collection separate you may or may not need arrays here.
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // optional
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // optional

  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },

  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  onlineStatus: { type: Boolean, default: false },
  lastSeen: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
