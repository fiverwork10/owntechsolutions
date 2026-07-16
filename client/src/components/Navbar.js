import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiMessageCircle, FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'Services' },
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/faq', label: 'FAQs' },
  { path: '/chat', label: 'Chat Bot' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setShowUserMenu(false); };

  const handleGuestLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/guest`);
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (err) { console.error(err); }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-[background,box-shadow] duration-500 ${
        scrolled
          ? 'bg-[rgba(10,10,10,0.85)] backdrop-blur-2xl shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group -ml-1 md:-ml-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-base md:text-lg group-hover:shadow-neon transition-all duration-300">
              O
            </div>
            <span className="text-lg md:text-xl font-bold whitespace-nowrap">
              <span className="gradient-text">Own</span>
              <span className="text-white">Tech</span>
              <span className="text-primary">Solutions</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ willChange: 'transform' }}
                  className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 hover:scale-105 group ${
                    isActive
                      ? 'text-white [text-shadow:0_0_8px_rgba(255,255,255,0.4)]'
                      : 'text-white'
                  }`}
                >
                  <span className="absolute inset-0 rounded-lg border border-transparent group-hover:bg-white/5 group-hover:border-white/20 group-hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] transition-all duration-300" />
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/30 rounded-lg border border-primary/50 shadow-lg shadow-primary/40"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 text-white group-hover:[text-shadow:0_0_12px_rgba(255,255,255,0.5),0_0_24px_rgba(255,255,255,0.2)] transition-all duration-300">{link.label}</span>
                </Link>
              );
            })}
            <Link
              to="/contact"
              className="ml-4 btn-primary !px-5 !py-2.5 !text-sm !rounded-lg group hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-shadow duration-300"
            >
              <FiMessageCircle className="group-hover:rotate-12 transition-transform duration-300" />
              Contact Us
            </Link>

            {token && user && user.role !== 'admin' ? (
              <div className="relative ml-auto" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                  {user.name?.[0]?.toUpperCase() || <FiUser size={16} />}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-14 w-48 glass-strong rounded-2xl p-2 border border-glass-border shadow-xl z-50">
                      <div className="px-3 py-2 border-b border-glass-border mb-1">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
                        <FiLogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-auto">
                  <Link to="/login"
                    className="px-4 py-2 rounded-xl glass text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 border border-glass-border hover:border-white/30 hover:shadow-[0_0_16px_rgba(255,255,255,0.15)] transition-all duration-300">
                    <FiLogIn size={15} className="inline mr-1.5" /> Login
                  </Link>
                <Link to="/signup"
                  className="px-4 py-2 rounded-xl gradient-bg text-sm font-medium text-white hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] transition-all duration-300">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {token && user && user.role !== 'admin' && (
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white">
                {user.name?.[0]?.toUpperCase() || <FiUser size={14} />}
              </div>
            )}
            {token && user && user.role === 'admin' && (
              <Link to="/admin/dashboard" className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white">
                <FiUser size={14} />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl glass text-white hover:bg-primary/20 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: 'top', willChange: 'transform, opacity' }}
            className="lg:hidden border-t border-glass-border"
          >
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1 bg-background/95 backdrop-blur-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <Link
                      to={link.path}
                      className={`block text-center px-4 py-3 rounded-xl font-bold transition-all duration-200 text-base ${
                        isActive
                          ? 'bg-primary/10 text-white border border-primary/20 shadow-[0_0_12px_rgba(139,92,246,0.2)] [text-shadow:0_0_8px_rgba(255,255,255,0.4)]'
                          : 'text-white/80 hover:text-white hover:bg-white/5 hover:scale-[1.02] hover:shadow-[0_0_16px_rgba(255,255,255,0.15)] hover:[text-shadow:0_0_8px_rgba(255,255,255,0.4)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <Link
                to="/chat"
                className="block text-center mt-3 sm:mt-4 px-4 py-3 rounded-xl font-bold text-base bg-gradient-to-r from-primary/20 to-primary/10 text-white border border-primary/20 hover:from-white/20 hover:to-white/10 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-200"
              >
                <FiMessageCircle className="inline mr-2" /> Contact Us
              </Link>

              <div className="border-t border-glass-border pt-3 mt-3 space-y-2">
                {token && user && user.role !== 'admin' ? (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl glass">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold">{user.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{user.name}</p>
                        <p className="text-xs text-text-muted truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 p-2">
                      <FiLogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl glass text-text-secondary hover:text-white hover:bg-primary/10 border border-glass-border transition-all text-sm font-medium">
                      <FiLogIn size={16} /> Login
                    </Link>
                    <Link to="/signup"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                      <FiUserPlus size={16} /> Sign Up
                    </Link>
                  </>
                )}
                {!token && (
                  <button onClick={handleGuestLogin}
                    className="w-full text-center text-xs text-text-muted hover:text-primary transition-colors py-1">
                    Continue as Guest
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
