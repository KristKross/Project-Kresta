const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tier: { type: String, enum: ["free", "pro", "business"], default: "pro" },
  expiresAt: { type: Date, default: null },
});

premiumSchema.pre("save", function (next) {
  if (this.tier !== "free" && !this.expiresAt) {
    this.expiresAt = new Date();
    this.expiresAt.setMonth(this.expiresAt.getMonth() + 1);
  }
  next();
});

module.exports = mongoose.model('Premium', premiumSchema);