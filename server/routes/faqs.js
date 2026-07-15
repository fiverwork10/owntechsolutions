const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getFAQs, getCategories, createFAQ,
  updateFAQ, deleteFAQ
} = require('../controllers/faqController');

router.get('/', getFAQs);
router.get('/categories', getCategories);
router.post('/', adminAuth, createFAQ);
router.put('/:id', adminAuth, updateFAQ);
router.delete('/:id', adminAuth, deleteFAQ);

module.exports = router;
