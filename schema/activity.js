const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activity_type: { type: String, required: true }, // "Photo Upload", "New Comment", etc.
  timestamp: { type: Date, default: Date.now },
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" }, // optional, only for photo-related activities
});

const Activity = mongoose.model("Activity", ActivitySchema);

module.exports = Activity;
