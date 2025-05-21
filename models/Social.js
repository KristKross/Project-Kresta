const mongoose = require('mongoose');

const socialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pageId: { type: String, default: null },
  instagramAccountId: { type: String, default: null },
  instagramAccessToken: { type: String, default: null },
});

module.exports = mongoose.model('Social', socialSchema);