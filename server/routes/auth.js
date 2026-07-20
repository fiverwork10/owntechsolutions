const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { register, login, getMe, updateProfile, changePassword, guestRegister, registerAdmin, getUsers, getUserStats } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential required' });
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || 'Google User',
        email,
        password: sub + process.env.JWT_SECRET,
        role: 'user',
        avatar: picture || '',
      });
      await user.save();
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

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
