import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCalendar, FiShield, FiMail, FiUser, FiEye, FiMessageSquare, FiStar, FiTrendingUp, FiX, FiPlus } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, LineChart, Line, Area, AreaChart, Cell, PieChart, Pie } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

const COLORS = { purple: '#8B5CF6', green: '#10B981', blue: '#3B82F6', amber: '#F59E0B', pink: '#EC4899' };

export default function AdminUsers() {
  const { API } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [createError, setCreateError] = useState('');

  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/auth/users'),
        API.get('/auth/stats')
      ]);
      return { users: usersRes.data, stats: statsRes.data };
    },
  });

  const users = usersData.users || [];
  const stats = usersData.stats || null;

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      await API.post('/auth/register-admin', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreateModal(false);
      setForm({ name: '', email: '', password: '' });
      setCreateError('');
    },
    onError: (err) => {
      setCreateError(err.response?.data?.message || 'Failed to create admin');
    },
  });

  const createAdmin = (e) => {
    e.preventDefault();
    setCreateError('');
    createMutation.mutate(form);
  };

  if (isLoading) return <AdminLayout title="Users"><div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></AdminLayout>;

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = totalUsers - adminCount;
  const guestCount = users.filter(u => u.name?.startsWith('Guest_')).length;
  const trend = stats?.registrationTrend || [];
  const roleDist = stats?.roleDistribution || [];

  return (
    <AdminLayout title="Users">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Total Users</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <FiUsers size={16} className="text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Registered Users</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <FiUser size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{userCount}</p>
        </div>
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Guest Users</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <FiUser size={16} className="text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{guestCount}</p>
        </div>
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Admins</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-teal-500/30 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <FiShield size={16} className="text-cyan-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{adminCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card card-gradient card-glow lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-primary" /> User Registration Trend
          </h2>
          {trend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={(v) => { try { return format(parseISO(v), 'MMM dd'); } catch { return v; }}} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <ReTooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="glass p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: 'rgba(15,23,42,0.95)' }}>
                      <p className="text-xs text-white/50">{label}</p>
                      <p className="text-sm font-bold text-white mt-1">{payload[0].value} new users</p>
                    </div>
                  ) : null} />
                  <Area type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} fill="url(#userGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/50 text-sm py-8 text-center">No registration data yet</p>
          )}
        </div>

        <div className="card card-gradient card-glow">
          <h2 className="text-lg font-bold text-white mb-4">User Roles</h2>
          {roleDist.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="_id">
                    {roleDist.map((entry, i) => (
                      <Cell key={i} fill={entry._id === 'admin' ? COLORS.blue : COLORS.purple} />
                    ))}
                  </Pie>
                  <ReTooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="glass p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: 'rgba(15,23,42,0.95)' }}>
                      <p className="text-sm font-bold text-white capitalize">{payload[0].name}</p>
                      <p className="text-xs text-white/70 mt-1">Count: <span className="text-white font-bold">{payload[0].value}</span></p>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/50 text-sm py-8 text-center">No role data</p>
          )}
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.purple }} /> Users: {roleDist.find(r => r._id === 'user')?.count || 0}</div>
            <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full" style={{ background: COLORS.blue }} /> Admins: {roleDist.find(r => r._id === 'admin')?.count || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Total Project Views</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <FiEye size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalProjectViews || 0}</p>
        </div>
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Total Contacts</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 shadow-lg shadow-green-500/20">
              <FiMessageSquare size={16} className="text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalContacts || 0}</p>
        </div>
        <div className="card card-gradient card-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">Total Feedback</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/30 to-yellow-500/30 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <FiStar size={16} className="text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalFeedback || 0}</p>
        </div>
      </div>

      <div className="card card-gradient card-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FiUsers className="text-primary" /> All Users
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreateModal(true)} className="btn-cyan btn-primary text-xs !py-2 !px-3 flex items-center gap-1.5">
              <FiPlus size={14} /> Create Admin
            </button>
            <span className="text-xs text-white/50">{users.length} users</span>
          </div>
        </div>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="text-left py-3 px-3 text-white/60 font-medium">User</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Role</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Joined</th>
                  <th className="text-left py-3 px-3 text-white/60 font-medium">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-glass-border/50 hover:bg-primary/5 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold text-white">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-white/70">
                      <span className="flex items-center gap-1.5"><FiMail size={12} /> {u.email}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        u.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white/70 text-xs">
                      <span className="flex items-center gap-1.5"><FiCalendar size={11} /> {(() => { try { return format(parseISO(u.createdAt), 'MMM dd, yyyy'); } catch { return ''; } })()}</span>
                    </td>
                    <td className="py-3 px-3 text-white/70 text-xs">
                      {u.lastLogin ? (() => { try { return format(parseISO(u.lastLogin), 'MMM dd, yyyy'); } catch { return ''; } })() : 'Never'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/50 text-sm py-8 text-center">No users registered yet</p>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white">
                <FiX size={16} />
              </button>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiShield className="text-primary" /> Create Admin User
              </h2>
              {createError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{createError}</div>
              )}
              <form onSubmit={createAdmin} className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="input-field" />
                </div>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full !py-3.5">
                  {createMutation.isPending ? 'Creating...' : 'Create Admin'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
