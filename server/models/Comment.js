const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  userName: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true },
  comment: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

commentSchema.index({ projectId: 1, createdAt: -1 });
commentSchema.index({ videoId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
