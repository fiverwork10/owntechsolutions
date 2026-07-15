const Project = require('../models/Project');
const { emitDashboardUpdate } = require('../utils/dashboardSocket');
const { deleteFromCloudinary } = require('../config/cloudinary');

exports.getProjects = async (req, res) => {
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
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Project.countDocuments(query);
    res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Project not found' });
    }
    project.views += 1;
    await project.save();
    const io = req.app.get('io');
    if (io) {
      io.emit('view:update', { type: 'project', id: project._id, views: project.views });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    if (typeof projectData.commentsEnabled === 'string') {
      projectData.commentsEnabled = projectData.commentsEnabled === 'true';
    }
    if (typeof projectData.isPublished === 'string') {
      projectData.isPublished = projectData.isPublished === 'true';
    }
    if (typeof projectData.tags === 'string') {
      projectData.tags = projectData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (req.files) {
      if (req.files.images) {
        projectData.images = req.files.images.map(f => ({
          url: f.path,
          publicId: f.filename
        }));
      }
      if (req.files.videos) {
        projectData.videos = req.files.videos.map(f => ({
          url: f.path,
          publicId: f.filename
        }));
      }
      if (req.files.documents) {
        projectData.documents = req.files.documents.map(f => ({
          url: f.path,
          publicId: f.filename,
          name: f.originalname
        }));
      }
    }
    const project = new Project(projectData);
    await project.save();
    emitDashboardUpdate(req.app.get('io'));
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
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
    if (req.body.removedImages) {
      let idsToRemove = [];
      try { idsToRemove = JSON.parse(req.body.removedImages); } catch { idsToRemove = []; }
      if (idsToRemove.length > 0) {
        const kept = [];
        for (const img of project.images) {
          if (idsToRemove.includes(img.publicId)) {
            deleteFromCloudinary(img.publicId);
          } else {
            kept.push(img);
          }
        }
        project.images = kept;
      }
    }
    Object.assign(project, updateData);
    if (req.files) {
      if (req.files.images) {
        project.images = [
          ...project.images,
          ...req.files.images.map(f => ({ url: f.path, publicId: f.filename }))
        ];
      }
      if (req.files.videos) {
        project.videos = [
          ...project.videos,
          ...req.files.videos.map(f => ({ url: f.path, publicId: f.filename }))
        ];
      }
      if (req.files.documents) {
        project.documents = [
          ...project.documents,
          ...req.files.documents.map(f => ({ url: f.path, publicId: f.filename, name: f.originalname }))
        ];
      }
    }
    if (req.body.isPublished && !project.publishedAt) {
      project.publishedAt = new Date();
    }
    await project.save();
    emitDashboardUpdate(req.app.get('io'));
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const allFiles = [...project.images, ...project.videos, ...project.documents];
    allFiles.forEach(file => {
      if (file.publicId) deleteFromCloudinary(file.publicId);
    });
    await Project.findByIdAndDelete(req.params.id);
    emitDashboardUpdate(req.app.get('io'));
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.isPublished = !project.isPublished;
    if (project.isPublished) project.publishedAt = new Date();
    await project.save();
    emitDashboardUpdate(req.app.get('io'));
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
