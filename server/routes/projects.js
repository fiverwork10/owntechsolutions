const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = require('../middleware/upload');
const { optionalAuth, auth, adminAuth } = require('../middleware/auth');
const {
  getProjects, getProject, createProject,
  updateProject, deleteProject, togglePublish
} = require('../controllers/projectController');

const cpUpload = upload.fields([
  { name: 'images', maxCount: 12 },
  { name: 'videos', maxCount: 5 },
  { name: 'documents', maxCount: 5 }
]);

router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProject);
router.post('/', adminAuth, cpUpload, createProject);
router.put('/:id', adminAuth, cpUpload, updateProject);
router.delete('/:id', adminAuth, deleteProject);
router.patch('/:id/toggle-publish', adminAuth, togglePublish);

module.exports = router;
