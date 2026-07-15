const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getTestimonials, createTestimonial,
  updateTestimonial, deleteTestimonial
} = require('../controllers/testimonialController');

router.get('/', getTestimonials);
router.post('/', adminAuth, createTestimonial);
router.put('/:id', adminAuth, updateTestimonial);
router.delete('/:id', adminAuth, deleteTestimonial);

module.exports = router;
