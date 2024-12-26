"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  location: String,
  description: String,
  occupation: String,
  login_name: { type: String, required: true, unique: true },
  //password: String,
  password: { type: String, required: true }, // password field
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  latest_activity: {
    type: { type: String },  // e.g., "photo_upload"
    photo_thumbnail: String,  // File name of the uploaded photo (for thumbnail)
    timestamp: { type: Date },  // Timestamp of the activity
  }
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
