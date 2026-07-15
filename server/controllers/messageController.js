const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { emitDashboardUpdate } = require('../utils/dashboardSocket');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1 })
      .populate('userId', 'name email avatar');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('userId', 'name email avatar');
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId, page = 1, limit = 50 } = req.query;
    const query = { conversationId };
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Message.countDocuments(query);
    res.json({ messages: messages.reverse(), total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType, fileUrl, fileName, fileSize, mimeType } = req.body;
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      conversation = new Conversation({
        guestId: req.body.guestId || 'guest_' + Date.now(),
        visitorName: req.body.visitorName || 'Guest'
      });
      await conversation.save();
    }
    const message = new Message({
      conversationId: conversation._id,
      sender: req.user ? (req.user.role === 'admin' ? 'admin' : 'user') : 'user',
      senderName: req.user ? req.user.name : (req.body.visitorName || 'Guest'),
      content,
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      fileSize,
      mimeType
    });
    await message.save();
    conversation.lastMessage = content || (fileName || 'File sent');
    conversation.lastMessageAt = new Date();
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    await conversation.save();
    emitDashboardUpdate(req.app.get('io'));
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    await Message.updateMany(
      { conversationId, isRead: false, sender: { $ne: 'admin' } },
      { isRead: true }
    );
    await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const conversation = new Conversation(req.body);
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
