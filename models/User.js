const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profilePicture: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('remove', async function(next) {
  await mongoose.model('Workspace').deleteMany({ owner: this._id });
  await mongoose.model('Task').deleteMany({ owner: this._id });
  await mongoose.model('Notification').deleteMany({ user: this._id });
  await mongoose.model('Social').deleteMany({ userId: this._id });
  await mongoose.model('Premium').deleteMany({ userId: this._id });
  next();
});

mongoose.model('User').collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 * 2 });

module.exports = mongoose.model("User", userSchema);
