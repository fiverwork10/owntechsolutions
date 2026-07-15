const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getConversations, getConversation, getMessages,
  sendMessage, markAsRead, createConversation
} = require('../controllers/messageController');

router.get('/conversations', adminAuth, getConversations);
router.get('/conversations/:id', adminAuth, getConversation);
router.get('/', adminAuth, getMessages);
router.post('/', sendMessage);
router.post('/conversations', createConversation);
router.put('/read', auth, markAsRead);

module.exports = router;
