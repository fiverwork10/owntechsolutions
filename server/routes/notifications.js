const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { getNotifications, markRead } = require('../controllers/notificationController');

router.get('/', adminAuth, getNotifications);
router.put('/:id/read', adminAuth, markRead);

module.exports = router;
