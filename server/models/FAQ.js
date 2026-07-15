const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'mern', 'mobile', 'flutter', 'react', 'nodejs', 'mongodb',
      'aspnet', 'ui-ux', 'pricing', 'hosting', 'deployment',
      'maintenance', 'security', 'seo', 'timelines', 'general'
    ]
  },
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

module.exports = mongoose.model('FAQ', faqSchema);
