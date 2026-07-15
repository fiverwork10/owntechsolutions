const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  features: [{ type: String, required: true }],
  technologies: [{ type: String, required: true }],
  icon: { type: String, required: true, default: 'FiCode' },
  color: { type: String, required: true, default: '#8B5CF6' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

serviceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', serviceSchema);
