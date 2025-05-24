const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },
  igPostId: { type: String, default: null },
  title: { type: String, required: true },
  caption: { type: String, required: true },
  imageUrl: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
