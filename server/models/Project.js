const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['web', 'mobile', 'enterprise', 'ui-ux', 'api', 'cloud', 'other'] },
  tags: [{ type: String, trim: true }],
  images: [{ url: String, publicId: String }],
  videos: [{ url: String, publicId: String }],
  documents: [{ url: String, publicId: String, name: String }],
  commentsEnabled: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  clientName: { type: String, default: '' },
  completionDate: { type: Date },
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

projectSchema.index({ category: 1, isPublished: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ name: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
