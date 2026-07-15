const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getContacts, createContact,
  markAsRead, markAsReplied, deleteContact
} = require('../controllers/contactController');

router.get('/', adminAuth, getContacts);
router.post('/', createContact);
router.patch('/:id/read', adminAuth, markAsRead);
router.patch('/:id/replied', adminAuth, markAsReplied);
router.delete('/:id', adminAuth, deleteContact);

module.exports = router;
