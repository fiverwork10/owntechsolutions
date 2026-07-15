const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { initWhatsApp, sendWhatsAppMessage, sendWhatsAppMedia, getStatus, TARGET_NUMBER } = require('./whatsapp');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/services', require('./routes/services'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/notifications', require('./routes/notifications'));

const upload = require('./middleware/upload');

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { message, guestId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    let conv = await Conversation.findOne({ guestId: guestId || 'guest_' + Date.now(), isActive: true });
    if (!conv) {
      conv = new Conversation({ guestId: guestId || 'guest_' + Date.now(), visitorName: 'Website Visitor', isActive: true });
      await conv.save();
    }

    const msg = new Message({
      conversationId: conv._id,
      sender: 'user',
      content: message,
      messageType: 'text',
      deliveredVia: 'socket'
    });
    await msg.save();

    conv.lastMessage = message;
    conv.lastMessageAt = new Date();
    conv.unreadCount = (conv.unreadCount || 0) + 1;
    await conv.save();

    const io = req.app.get('io');
    const msgObj = msg.toObject();
    if (io) {
      io.to('admin').emit('admin_message', { ...msgObj, conversation: conv });
      if (guestId) io.to(`user_${guestId}`).emit('user:new_message', msgObj);
    }

    res.json(msgObj);
  } catch (err) {
    console.error('Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/send-media', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const { type, caption, guestId, userId } = req.body;
    const isAdmin = req.body.sender === 'admin';

    let conv;
    if (isAdmin && req.body.conversationId) {
      conv = await Conversation.findById(req.body.conversationId);
    }
    if (!conv && userId) {
      conv = await Conversation.findOne({ userId, isActive: true });
    }
    if (!conv) {
      conv = await Conversation.findOne({ guestId: guestId || 'guest_' + Date.now(), isActive: true });
    }
    if (!conv) {
      conv = new Conversation({ guestId: guestId || 'guest_' + Date.now(), visitorName: 'Website Visitor', isActive: true });
      if (userId) conv.userId = userId;
      await conv.save();
    } else if (userId && !conv.userId) {
      conv.userId = userId;
      await conv.save();
    }

    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    const msg = new Message({
      conversationId: conv._id,
      sender: isAdmin ? 'admin' : 'user',
      content: caption || '',
      messageType: type === 'image' ? 'image' : type === 'video' ? 'video' : type === 'voice' ? 'voice' : 'document',
      fileUrl,
      filePublicId: publicId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      deliveredVia: 'socket'
    });
    await msg.save();

    conv.lastMessage = `${type === 'image' ? '📷' : type === 'video' ? '🎬' : type === 'voice' ? '🎤' : '📄'} ${req.file.originalname}`;
    conv.lastMessageAt = new Date();
    if (!isAdmin) conv.unreadCount = (conv.unreadCount || 0) + 1;
    await conv.save();

    const io = req.app.get('io');
    const msgObj = msg.toObject();
    if (io) {
      io.to('admin').emit('admin_message', { ...msgObj, conversation: conv });
      if (guestId) io.to(`user_${guestId}`).emit('user:new_message', msgObj);
      if (conv.userId) io.to(`user_${conv.userId}`).emit('user:new_message', msgObj);
    }

    res.json(msgObj);
  } catch (err) {
    console.error('Media error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/whatsapp/status', (req, res) => {
  res.json(getStatus());
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_admin', () => {
    socket.join('admin');
    console.log('Admin joined:', socket.id);
  });

  socket.on('leave_admin', () => {
    socket.leave('admin');
    console.log('Admin left:', socket.id);
  });

  socket.on('join_chat', (guestId) => {
    if (guestId) { socket.join(`user_${guestId}`); socket.join(guestId); }
  });

  socket.on('admin:reply', async (data) => {
    try {
      const msg = new Message({
        conversationId: data.conversationId,
        sender: 'admin',
        senderName: 'Support Team',
        content: data.content || '',
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || '',
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || '',
        deliveredVia: 'socket'
      });
      await msg.save();
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: data.content || data.fileName || 'Media',
        lastMessageAt: new Date()
      });
      const populated = await Message.findById(msg._id);
      io.to(`user_${data.guestId}`).emit('user:new_message', populated);
      const conv = await Conversation.findById(data.conversationId);
      if (conv?.userId) io.to(`user_${conv.userId}`).emit('user:new_message', populated);
      io.to('admin').emit('admin_message', populated);
      socket.emit('reply:sent', populated);
    } catch (err) { console.error('Admin reply error:', err); }
  });

  socket.on('user:send', async (data) => {
    try {
      let conv = await Conversation.findOne({ guestId: data.guestId, isActive: true });
      if (!conv) {
        conv = new Conversation({ guestId: data.guestId, visitorName: data.visitorName || 'Website Visitor', isActive: true });
        if (data.userId) conv.userId = data.userId;
        await conv.save();
      } else {
        if (data.visitorName && data.visitorName !== 'Website Visitor') conv.visitorName = data.visitorName;
        if (data.userId) conv.userId = data.userId;
        if (conv.isModified()) await conv.save();
      }
      const msg = new Message({
        conversationId: conv._id,
        sender: 'user',
        content: data.content || '',
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || '',
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || '',
        deliveredVia: 'socket'
      });
      await msg.save();
      conv.lastMessage = data.content || data.fileName || 'Media';
      conv.lastMessageAt = new Date();
      conv.unreadCount = (conv.unreadCount || 0) + 1;
      await conv.save();
      io.to('admin').emit('admin_message', { ...msg.toObject(), conversation: conv });
      io.to(`user_${data.guestId}`).emit('user:new_message', msg.toObject());
      if (data.userId) io.to(`user_${data.userId}`).emit('user:new_message', msg.toObject());
      socket.emit('user:message_sent', msg.toObject());
    } catch (err) { console.error('User send error:', err); }
  });

  socket.on('message:delete', async (data) => {
    try {
      await Message.findByIdAndDelete(data.messageId);
      io.to('admin').emit('message:deleted', { messageId: data.messageId, conversationId: data.conversationId });
      if (data.guestId) io.to(`user_${data.guestId}`).emit('message:deleted', { messageId: data.messageId, conversationId: data.conversationId });
      socket.emit('message:deleted', { messageId: data.messageId, conversationId: data.conversationId });
    } catch (err) { console.error('Delete error:', err); }
  });

  socket.on('conversation:delete', async (data) => {
    try {
      await Message.deleteMany({ conversationId: data.conversationId });
      await Conversation.findByIdAndDelete(data.conversationId);
      io.to('admin').emit('conversation:deleted', { conversationId: data.conversationId });
      if (data.guestId) io.to(`user_${data.guestId}`).emit('conversation:deleted', { conversationId: data.conversationId });
      socket.emit('conversation:deleted', { conversationId: data.conversationId });
    } catch (err) { console.error('Conversation delete error:', err); }
  });

  socket.on('user:typing', (data) => {
    io.to('admin').emit('user:typing', { guestId: data.guestId });
  });

  socket.on('user:stop_typing', (data) => {
    io.to('admin').emit('user:stop_typing', { guestId: data.guestId });
  });

  socket.on('admin:typing', (data) => {
    if (data.guestId) io.to(`user_${data.guestId}`).emit('admin:typing');
  });

  socket.on('admin:stop_typing', (data) => {
    if (data.guestId) io.to(`user_${data.guestId}`).emit('admin:stop_typing');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// REST endpoints for chat
app.get('/api/chat/history', async (req, res) => {
  try {
    const { guestId, userId } = req.query;
    let conv;
    if (userId) {
      conv = await Conversation.findOne({ userId, isActive: true });
      if (!conv) return res.json({ conversation: null, messages: [] });
    } else if (guestId) {
      conv = await Conversation.findOne({ guestId, isActive: true });
      if (!conv) return res.json({ conversation: null, messages: [] });
    } else {
      return res.json({ conversation: null, messages: [] });
    }
    const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
    res.json({ conversation: conv, messages });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/chat/conversations', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: { $ne: null } };
    if (search) {
      const users = await mongoose.model('User').find({ $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }
    const conversations = await Conversation.find(query).sort({ lastMessageAt: -1 }).limit(100).populate('userId', 'name email');
    res.json(conversations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/chat/conversation/:id', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/chat/message/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/chat/conversation/:id', async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.id });
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initWhatsApp();
});
