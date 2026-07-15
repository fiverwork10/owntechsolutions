const Video = require('../models/Video');
const Comment = require('../models/Comment');
const { emitDashboardUpdate } = require('../utils/dashboardSocket');
const { deleteFromCloudinary } = require('../config/cloudinary');

exports.getVideos = async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (!req.user || req.user.role !== 'admin') {
      query.isPublished = true;
    }
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$text = { $search: search };
    }
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Video.countDocuments(query);
    res.json({ videos, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (!video.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Video not found' });
    }
    video.views += 1;
    await video.save();
    const io = req.app.get('io');
    if (io) {
      io.emit('view:update', { type: 'video', id: video._id, views: video.views });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const videoData = { ...req.body };
    if (typeof videoData.commentsEnabled === 'string') {
      videoData.commentsEnabled = videoData.commentsEnabled === 'true';
    }
    if (typeof videoData.isPublished === 'string') {
      videoData.isPublished = videoData.isPublished === 'true';
    }
    if (typeof videoData.tags === 'string') {
      videoData.tags = videoData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (req.file) {
      videoData.url = req.file.path;
      videoData.publicId = req.file.filename;
    }
    const video = new Video(videoData);
    await video.save();
    emitDashboardUpdate(req.app.get('io'));
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const updateData = { ...req.body };
    if (typeof updateData.commentsEnabled === 'string') {
      updateData.commentsEnabled = updateData.commentsEnabled === 'true';
    }
    if (typeof updateData.isPublished === 'string') {
      updateData.isPublished = updateData.isPublished === 'true';
    }
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    Object.assign(video, updateData);
    if (req.file) {
      if (video.publicId) deleteFromCloudinary(video.publicId);
      video.url = req.file.path;
      video.publicId = req.file.filename;
    }
    if (video.isPublished && !video.publishedAt) {
      video.publishedAt = new Date();
    }
    await video.save();
    emitDashboardUpdate(req.app.get('io'));
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.publicId) deleteFromCloudinary(video.publicId);
    await Comment.deleteMany({ videoId: req.params.id });
    await Video.findByIdAndDelete(req.params.id);
    emitDashboardUpdate(req.app.get('io'));
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    video.isPublished = !video.isPublished;
    if (video.isPublished) video.publishedAt = new Date();
    await video.save();
    emitDashboardUpdate(req.app.get('io'));
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
