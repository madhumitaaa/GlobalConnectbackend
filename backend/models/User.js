// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // not required for OAuth users
  bio: { type: String, default: '' },

  profilePic: { type: String, default: '' },
  bannerPic: { type: String, default: '' },

  experience: { type: String, default: '' }, // simple text
  education: { type: String, default: '' },  // simple text
  skills: { type: String, default: '' },     // simple text

  linkedin: { type: String, default: '' },

  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },

  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  onlineStatus: { type: Boolean, default: false },
  lastSeen: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
