const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Testimonial = require('../models/Testimonial');

function buildCandlesticks(hourlyData) {
  const dayBuckets = {};
  for (const entry of hourlyData) {
    const { date, hour } = entry._id;
    if (!dayBuckets[date]) dayBuckets[date] = [];
    dayBuckets[date].push({ hour, count: entry.count });
  }

  return Object.entries(dayBuckets).map(([date, hours]) => {
    const sorted = hours.sort((a, b) => a.hour - b.hour);
    const values = sorted.map(h => h.count);
    return {
      date,
      open: values[0] || 0,
      high: Math.max(...values, 0),
      low: Math.min(...values, 0),
      close: values[values.length - 1] || 0,
      volume: values.reduce((s, v) => s + v, 0)
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

async function emitDashboardUpdate(io) {
  if (!io) return;
  try {
    const [
      totalProjects, publishedProjects, totalContacts, unreadContacts,
      totalConversations, activeConversations, totalTestimonials, activeTestimonials
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ isPublished: true }),
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      Conversation.countDocuments(),
      Conversation.countDocuments({ status: 'active' }),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ isActive: true })
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      projectsOverTime, contactsOverTime, messagesOverTime,
      testimonialsOverTime, chatsOverTime,
      messageCandlesticks
    ] = await Promise.all([
      Project.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Contact.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Message.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Testimonial.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Conversation.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Message.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            sender: { $ne: 'system' }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              hour: { $hour: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1, '_id.hour': 1 } }
      ])
    ]);

    const candlestickData = buildCandlesticks(messageCandlesticks);

    io.to('admin').emit('dashboard:update', {
      stats: {
        totalProjects,
        publishedProjects,
        unpublishedProjects: totalProjects - publishedProjects,
        totalContacts,
        unreadContacts,
        readContacts: totalContacts - unreadContacts,
        totalConversations,
        activeConversations,
        inactiveConversations: totalConversations - activeConversations,
        totalTestimonials,
        activeTestimonials,
        inactiveTestimonials: totalTestimonials - activeTestimonials
      },
      timeSeries: {
        projectsOverTime, contactsOverTime, messagesOverTime,
        testimonialsOverTime, chatsOverTime
      },
      candlestickData
    });
  } catch (err) {
    console.error('emitDashboardUpdate error:', err);
  }
}

module.exports = { emitDashboardUpdate };
