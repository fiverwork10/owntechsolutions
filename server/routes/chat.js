const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const axios = require('axios');

router.post('/whatsapp/webhook', async (req, res) => {
  try {
    const { entry } = req.body;
    if (!entry) return res.sendStatus(200);
    for (const e of entry) {
      for (const change of e.changes || []) {
        for (const message of change.value?.messages || []) {
          const from = message.from;
          let conversation = await Conversation.findOne({ whatsappNumber: from });
          if (!conversation) {
            conversation = new Conversation({
              visitorName: `WhatsApp: ${from}`,
              whatsappNumber: from,
              isFromWhatsApp: true,
              isActive: true
            });
            await conversation.save();
          }
          const msgData = {
            conversationId: conversation._id,
            sender: 'whatsapp',
            senderName: `WhatsApp: ${from}`,
            content: message.text?.body || '',
            messageType: message.type === 'text' ? 'text' : message.type,
            deliveredVia: 'whatsapp'
          };
          if (message.type === 'image') {
            msgData.messageType = 'image';
            msgData.fileUrl = message.image?.link || '';
          }
          if (message.type === 'video') {
            msgData.messageType = 'video';
            msgData.fileUrl = message.video?.link || '';
          }
          if (message.type === 'document') {
            msgData.messageType = 'document';
            msgData.fileUrl = message.document?.link || '';
            msgData.fileName = message.document?.filename || '';
          }
          if (message.type === 'voice') {
            msgData.messageType = 'voice';
            msgData.fileUrl = message.voice?.link || '';
          }
          const msg = new Message(msgData);
          await msg.save();
          conversation.lastMessage = msgData.content || 'Media received';
          conversation.lastMessageAt = new Date();
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          await conversation.save();
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(200);
  }
});

router.post('/whatsapp/send', adminAuth, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ message: 'Recipient and message are required' });
    }
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error('WhatsApp send error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to send WhatsApp message', error: error.response?.data });
  }
});

router.get('/whatsapp/verify', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
