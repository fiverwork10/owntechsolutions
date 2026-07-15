const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['web', 'mobile', 'enterprise', 'ui-ux', 'api', 'cloud', 'other'] },
  tags: [{ type: String, trim: true }],
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  commentsEnabled: { type: Boolean, default: true },
  views: { type: Number, default: 0 }
}, { timestamps: true });

videoSchema.index({ category: 1, isPublished: 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Video', videoSchema);
