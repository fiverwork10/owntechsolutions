const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestId: { type: String, default: '' },
  visitorName: { type: String, default: 'Guest' },
  visitorEmail: { type: String, default: '' },
  visitorPhone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isFromWhatsApp: { type: Boolean, default: false },
  whatsappNumber: { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date },
  unreadCount: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'waiting', 'closed'], default: 'active' }
}, { timestamps: true });

conversationSchema.index({ userId: 1 });
conversationSchema.index({ guestId: 1 });
conversationSchema.index({ status: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
