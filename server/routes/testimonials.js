const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getTestimonials, createTestimonial,
  updateTestimonial, deleteTestimonial
} = require('../controllers/testimonialController');

router.get('/', getTestimonials);
router.post('/', adminAuth, upload.single('photo'), createTestimonial);
router.put('/:id', adminAuth, upload.single('photo'), updateTestimonial);
router.delete('/:id', adminAuth, deleteTestimonial);

module.exports = router;
