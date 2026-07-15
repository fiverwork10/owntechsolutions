const Contact = require('../models/Contact');
const Notification = require('../models/Notification');
const { emitDashboardUpdate } = require('../utils/dashboardSocket');

exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('repliedBy', 'name email');
    const total = await Contact.countDocuments(query);
    res.json({ contacts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    const notification = await Notification.create({
      type: 'contact',
      title: 'New Contact Message',
      message: `${contact.name} sent: ${contact.message?.slice(0, 100)}`,
      link: '/admin/contacts'
    });
    const io = req.app.get('io');
    if (io) {
      const unreadCount = await Notification.countDocuments({ isRead: false });
      io.emit('notification:new', { notification, unreadCount });
    }
    emitDashboardUpdate(io);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    emitDashboardUpdate(req.app.get('io'));
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsReplied = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isReplied: true, repliedAt: new Date(), repliedBy: req.user._id },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    emitDashboardUpdate(req.app.get('io'));
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
