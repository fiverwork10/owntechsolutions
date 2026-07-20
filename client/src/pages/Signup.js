import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user, token, API } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (user && token && user.role !== 'admin') navigate('/');
  }, [user, token, navigate]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '332707371177-nbolpaebcv9151sgidp9o7gimqdgoj3q.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            setLoading(true);
            const res = await API.post('/auth/google', { credential: response.credential });
            localStorage.setItem('token', res.data.token);
            window.location.reload();
          } catch (err) {
            setError('Google sign-in failed');
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, { size: 'large', text: 'signup_with', shape: 'pill', width: 320 });
    };
    document.body.appendChild(script);
    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 md:pt-20 pb-8 md:pb-12 min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-dark rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 md:mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            O
          </motion.div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-text-secondary mt-2">Join us and explore our services</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="glass-strong rounded-3xl p-5 md:p-8 border border-primary/10">
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" required
                  className="input-field pl-11 !py-2.5" />
              </div>
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com" required
                  className="input-field pl-11 !py-2.5" />
              </div>
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required minLength={6}
                  className="input-field pl-11 pr-12 !py-2.5" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1 block">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••" required minLength={6}
                  className="input-field pl-11 !py-2.5" />
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="btn-primary w-full !py-3 text-sm group">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background-card px-4 text-text-muted">or</span></div>
          </div>

          <div ref={googleBtnRef} className="flex justify-center mb-4" />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background-card px-4 text-text-muted">Already have an account?</span></div>
          </div>

          <Link to="/login"
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl glass text-text-secondary hover:text-white hover:bg-primary/10 border border-glass-border hover:border-primary/30 transition-all text-sm font-medium group">
            <FiLogIn size={16} /> Sign In <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
