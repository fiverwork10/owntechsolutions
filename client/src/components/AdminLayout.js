import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiFolder, FiMail, FiBarChart2, FiHelpCircle, FiStar, FiMenu, FiX, FiGrid, FiChevronLeft, FiMessageSquare, FiThumbsUp, FiUsers, FiBell } from 'react-icons/fi';
import { FaRocket, FaComments, FaProjectDiagram, FaCogs, FaRegSmile, FaEnvelope, FaUsers, FaQuestionCircle, FaStar } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useAuth, API } from '../context/AuthContext';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const iconColors = [
  'from-cyan-400 to-blue-500',
  'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-indigo-400 to-blue-600',
  'from-fuchsia-400 to-pink-500',
  'from-yellow-400 to-amber-500',
];

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: FaRocket, color: iconColors[0] },
  { path: '/admin/chat', label: 'Live Chat', icon: FaComments, color: iconColors[1] },
  { path: '/admin/projects', label: 'Projects', icon: FaProjectDiagram, color: iconColors[2] },
  { path: '/admin/services', label: 'Services', icon: FaCogs, color: iconColors[3] },
  { path: '/admin/feedback', label: 'Feedback', icon: FaRegSmile, color: iconColors[4] },
  { path: '/admin/contacts', label: 'Contacts', icon: FaEnvelope, color: iconColors[5] },
  { path: '/admin/users', label: 'Users', icon: FaUsers, color: iconColors[6] },
  { path: '/admin/faqs', label: 'FAQs', icon: FaQuestionCircle, color: iconColors[7] },
  { path: '/admin/testimonials', label: 'Testimonials', icon: FaStar, color: iconColors[8] },
];

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const backdropVariants = {
  visible: { opacity: 1, transition: { duration: 0.2 } },
  hidden: { opacity: 0, transition: { duration: 0.2 } },
};

export default function AdminLayout({ children, title }) {
  const { user, logout, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const { data: notifData } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: async () => {
      const res = await API.get('/notifications');
      return res.data;
    },
  });

  useEffect(() => {
    if (notifData) {
      setNotifications(notifData.notifications || []);
      setUnreadCount(notifData.unreadCount || 0);
    }
  }, [notifData]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit('join_admin');
    socket.on('notification:new', (data) => {
      if (data.notification) setNotifications(prev => [data.notification, ...prev]);
      if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
    });
    return () => { socket.emit('leave_admin'); socket.disconnect(); };
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', check);
    check();
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (loading) return;
    if (!token || !user || user.role !== 'admin') navigate('/admin');
  }, [token, user, navigate, loading]);

  const handleLogout = () => { logout(); navigate('/admin'); };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? 'closed' : 'open'}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed lg:absolute inset-y-0 left-0 z-50 w-64 bg-background-card border-r border-glass-border flex flex-col"
      >
        <div className="p-6 border-b border-glass-border flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            <span className="gradient-text">Own</span>Tech<span className="text-primary">Admin</span>
          </Link>
          {!isMobile && (
            <motion.button onClick={() => setSidebarOpen(false)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-xl glass flex items-center justify-center text-text-secondary hover:text-white transition-all">
              <FiChevronLeft size={16} />
            </motion.button>
          )}
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <motion.div
                key={link.path}
                whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              >
                <Link
                  to={link.path}
                  onClick={() => { if (isMobile) setSidebarOpen(false); }}
                  className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 border border-primary/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'text-white/70 hover:text-white hover:bg-primary/10 border border-transparent hover:border-primary/20'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.2 }}
                    transition={{ duration: 0.4 }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${link.color} bg-opacity-20 ${isActive ? 'shadow-lg shadow-purple-500/30' : 'opacity-80 group-hover:opacity-100'}`}
                  >
                    <link.icon size={16} className="text-white" />
                  </motion.div>
                  <span className="text-sm font-medium">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border">
          <div className="flex items-center gap-3 mb-3 px-4 py-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/50">Admin</p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <FiLogOut size={18} /> <span className="text-sm">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : ''}`}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-glass-border p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white hover:bg-primary/20 transition-all duration-200"
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-xl glass flex items-center justify-center text-white hover:bg-primary/20 transition-all duration-200">
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-80 glass-strong rounded-2xl border border-glass-border shadow-xl z-50 max-h-96 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={() => markAsRead('all')} className="text-xs text-primary hover:text-primary-light transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 20).map((n) => (
                          <div key={n._id} onClick={() => { if (!n.isRead) markAsRead(n._id); }}
                            className={`px-4 py-3 border-b border-glass-border/50 cursor-pointer transition-colors hover:bg-primary/5 ${!n.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{n.title}</p>
                                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-sm text-text-muted">No notifications</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
