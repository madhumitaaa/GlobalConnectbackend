const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },

  bio: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  title: { type: String, default: "" },
  location: { type: String, default: "" },
  company: { type: String, default: "" },
  education: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },

  skills: { type: [String], default: [] },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],


  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
