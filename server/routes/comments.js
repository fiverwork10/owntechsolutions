const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getComments, getVideoComments, getAllComments, createComment,
  approveComment, deleteComment, getFeedbackStats
} = require('../controllers/commentController');

router.get('/stats', adminAuth, getFeedbackStats);
router.get('/project/:projectId', getComments);
router.get('/video/:videoId', getVideoComments);
router.get('/all', adminAuth, getAllComments);
router.post('/', createComment);
router.patch('/:id/approve', adminAuth, approveComment);
router.delete('/:id', adminAuth, deleteComment);

module.exports = router;
