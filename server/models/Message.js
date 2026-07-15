const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, enum: ['user', 'admin', 'whatsapp'], required: true },
  senderName: { type: String, default: '' },
  content: { type: String, default: '' },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'voice', 'emoji', 'system'],
    default: 'text'
  },
  fileUrl: { type: String, default: '' },
  filePublicId: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  deliveredVia: { type: String, enum: ['socket', 'whatsapp', 'both'], default: 'socket' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
