// models/Job.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalaryRangeSchema = new Schema({
  min: { type: Number },
  max: { type: Number },
  currency: { type: String, default: 'INR' }
}, { _id: false });

const JobSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String, index: true }],
  location: { type: String, index: true }, // city, remote, country
  remote: { type: Boolean, default: false },
  seniority: { type: String, enum: ['Intern','Junior','Mid','Senior','Lead','Manager','Director','Other'], default: 'Mid' },
  experienceYears: { type: Number, default: 0 },
  employmentType: { type: String, enum: ['Full-time','Part-time','Contract','Internship','Freelance'], default: 'Full-time' },
  salaryRange: SalaryRangeSchema,
  postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
  applies: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  meta: { type: { appliedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }] }, default: { appliedUsers: [] } }

}, { timestamps: true });

// Full-text index for keyword search
JobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' }, { weights: { title: 5, skills: 4, company: 3, description: 1 }});

module.exports = mongoose.model('Job', JobSchema);
