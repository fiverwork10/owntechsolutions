const Comment = require('../models/Comment');
const mongoose = require('mongoose');

exports.getComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const comments = await Comment.find({ projectId, isApproved: true }).sort({ createdAt: -1 });
    const ratingStats = await Comment.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId), isApproved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({
      comments,
      stats: ratingStats[0] || { average: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await Comment.find({ videoId, isApproved: true }).sort({ createdAt: -1 });
    const ratingStats = await Comment.aggregate([
      { $match: { videoId: new mongoose.Types.ObjectId(videoId), isApproved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({
      comments,
      stats: ratingStats[0] || { average: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type === 'video') {
      filter.videoId = { $ne: null };
    } else if (req.query.type === 'project') {
      filter.projectId = { $ne: null };
    }
    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .populate('projectId', 'title')
      .populate('videoId', 'title');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { projectId, videoId } = req.body;
    if (!projectId && !videoId) {
      return res.status(400).json({ message: 'Either projectId or videoId is required' });
    }
    const comment = new Comment({ ...req.body, isApproved: true });
    await comment.save();
    const io = req.app.get('io');
    if (io) {
      const targetId = projectId || videoId;
      const type = projectId ? 'project' : 'video';
      const ratingStats = await Comment.aggregate([
        { $match: { [type === 'project' ? 'projectId' : 'videoId']: new mongoose.Types.ObjectId(targetId), isApproved: true } },
        { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      io.emit('comment:new', {
        type,
        id: targetId,
        comment,
        stats: ratingStats[0] || { average: 0, count: 0 }
      });
    }
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Comment.countDocuments();
    const avgRating = await Comment.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);
    const ratingDistribution = await Comment.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const perProject = await Comment.aggregate([
      { $match: { projectId: { $ne: null } } },
      { $group: { _id: '$projectId', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' }
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectName: { $ifNull: ['$project.title', 'Unknown'] }, count: 1, avgRating: 1 } }
    ]);
    const recentFeedback = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('projectId', 'title')
      .populate('videoId', 'title')
      .lean();
    const feedbackTrend = await Comment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    const Contact = require('../models/Contact');
    const totalVisitors = await Contact.countDocuments();

    res.json({
      totalFeedback,
      averageRating: avgRating[0]?.average || 0,
      ratingDistribution: Array.from({ length: 5 }, (_, i) => {
        const found = ratingDistribution.find(r => r._id === i + 1);
        return { rating: i + 1, count: found?.count || 0 };
      }),
      perProject,
      recentFeedback,
      feedbackTrend,
      totalVisitors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
