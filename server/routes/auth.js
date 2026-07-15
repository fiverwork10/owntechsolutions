const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, guestRegister, registerAdmin, getUsers, getUserStats } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestRegister);
router.post('/register-admin', adminAuth, registerAdmin);
router.get('/me', auth, getMe);
router.get('/users', adminAuth, getUsers);
router.get('/stats', adminAuth, getUserStats);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
