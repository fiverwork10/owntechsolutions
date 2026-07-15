const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { getDashboardStats, getAnalytics } = require('../controllers/analyticsController');

router.get('/dashboard', adminAuth, getDashboardStats);
router.get('/data', adminAuth, getAnalytics);

module.exports = router;
