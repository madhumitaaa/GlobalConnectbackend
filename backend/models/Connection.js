// models/Connection.js

const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["REQUESTED", "ACCEPTED", "REJECTED"],
    default: "REQUESTED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Connection", connectionSchema);
