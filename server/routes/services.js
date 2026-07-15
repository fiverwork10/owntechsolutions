const express = require('express');
const router = express.Router();
const { adminAuth, optionalAuth } = require('../middleware/auth');
const {
  getServices, getService, createService,
  updateService, deleteService
} = require('../controllers/serviceController');

router.get('/', optionalAuth, getServices);
router.get('/:id', getService);
router.post('/', adminAuth, createService);
router.put('/:id', adminAuth, updateService);
router.delete('/:id', adminAuth, deleteService);

module.exports = router;
