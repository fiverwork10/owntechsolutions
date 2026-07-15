const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { optionalAuth, auth, adminAuth } = require('../middleware/auth');
const {
  getVideos, getVideo, createVideo,
  updateVideo, deleteVideo, togglePublish
} = require('../controllers/videoController');

router.get('/', optionalAuth, getVideos);
router.get('/:id', optionalAuth, getVideo);
router.post('/', adminAuth, upload.single('video'), createVideo);
router.put('/:id', adminAuth, upload.single('video'), updateVideo);
router.delete('/:id', adminAuth, deleteVideo);
router.patch('/:id/toggle-publish', adminAuth, togglePublish);

module.exports = router;
