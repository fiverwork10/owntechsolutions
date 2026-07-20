const Testimonial = require('../models/Testimonial');
const { emitDashboardUpdate } = require('../utils/dashboardSocket');

exports.getTestimonials = async (req, res) => {
  try {
    const query = req.user?.role === 'admin' ? {} : { isActive: true };
    const testimonials = await Testimonial.find(query).sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = req.file.path;
    } else if (req.body.photo) {
      data.photo = req.body.photo;
    }
    if (data.rating) data.rating = Number(data.rating);
    const testimonial = new Testimonial(data);
    await testimonial.save();
    emitDashboardUpdate(req.app.get('io'));
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.photo = req.file.path;
    } else if (req.body.photo) {
      data.photo = req.body.photo;
    }
    if (data.rating) data.rating = Number(data.rating);
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    emitDashboardUpdate(req.app.get('io'));
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    emitDashboardUpdate(req.app.get('io'));
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
