import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiMessageSquare, FiUsers, FiTrash2, FiThumbsUp, FiCalendar } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const COLORS = {
  purple: '#8B5CF6', green: '#10B981', blue: '#3B82F6',
  amber: '#F59E0B', pink: '#EC4899', teal: '#14B8A6', red: '#EF4444'
};

const RATING_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#8B5CF6'];

const starIcons = Array.from({ length: 5 }, (_, i) => (
  <FiStar key={i} className="inline" size={14} />
));

function RatingStars({ rating, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
        />
      ))}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-xs">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

export default function AdminFeedback() {
  const { API } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'feedback'],
    queryFn: async () => {
      const res = await API.get('/comments/stats');
      return res.data;
    },
  });

  React.useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit('join_admin');
    socket.on('comment:new', () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    });
    return () => { socket.emit('leave_admin'); socket.disconnect(); };
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });

  const handleDelete = (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <AdminLayout title="Feedback"><div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></AdminLayout>;

  const avgRating = data?.averageRating || 0;
  const ratingDist = data?.ratingDistribution || [];
  const perProject = data?.perProject || [];
  const recentFeedback = data?.recentFeedback || [];

  return (
    <AdminLayout title="Feedback Analytics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiMessageSquare} label="Total Feedback" value={data?.totalFeedback || 0} color="#3B82F6" />
        <StatCard
          icon={FiStar}
          label="Average Rating"
          value={avgRating.toFixed(1)}
          color={COLORS.amber}
          subtitle={<RatingStars rating={Math.round(avgRating)} />}
        />
        <StatCard icon={FiUsers} label="Total Visitors" value={data?.totalVisitors || 0} color={COLORS.green} />
        <StatCard
          icon={FiThumbsUp}
          label="Satisfaction Rate"
          value={data?.totalFeedback > 0 ? `${((ratingDist.slice(3).reduce((a, b) => a + b.count, 0) / data.totalFeedback) * 100).toFixed(0)}%` : '0%'}
          color={COLORS.purple}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card card-gradient card-glow">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FiStar className="text-amber-400" /> Rating Distribution
          </h2>
          {ratingDist.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDist} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="rating" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ReTooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="glass p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: 'rgba(15,23,42,0.95)' }}>
                      <p className="text-sm font-bold text-white">{payload[0].payload.rating} Star</p>
                      <p className="text-xs text-white/70 mt-1">Count: <span className="text-white font-bold">{payload[0].value}</span></p>
                    </div>
                  ) : null} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {ratingDist.map((entry, i) => (
                      <Cell key={i} fill={RATING_COLORS[i] || COLORS.purple} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/50 text-sm py-8 text-center">No ratings yet</p>
          )}
        </div>

        <div className="card card-gradient card-glow">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FiThumbsUp className="text-green-400" /> Most Rated Projects
          </h2>
          {perProject.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perProject} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                  <YAxis dataKey="projectName" type="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <ReTooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="glass p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: 'rgba(15,23,42,0.95)' }}>
                      <p className="text-sm font-bold text-white">{payload[0].payload.projectName}</p>
                      <p className="text-xs text-white/70 mt-1">Feedback: <span className="text-white font-bold">{payload[0].value}</span></p>
                      <p className="text-xs text-white/70">Avg Rating: <span className="text-amber-400 font-bold">{payload[0].payload.avgRating?.toFixed(1)} ★</span></p>
                    </div>
                  ) : null} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {perProject.map((_, i) => (
                      <Cell key={i} fill={COLORS.purple} opacity={1 - i * 0.08} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/50 text-sm py-8 text-center">No project feedback yet</p>
          )}
        </div>
      </div>

      <div className="card card-gradient card-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FiMessageSquare className="text-primary" /> All Feedback
          </h2>
          <span className="text-xs text-white/50">{recentFeedback.length} entries</span>
        </div>
        {recentFeedback.length > 0 ? (
          <div className="space-y-3">
            {recentFeedback.map((fb) => (
              <motion.div
                key={fb._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl glass border border-glass-border hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{fb.userName}</span>
                      {fb.email && <span className="text-xs text-white/50">{fb.email}</span>}
                      {(fb.projectId || fb.videoId) && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary">
                          {fb.projectId?.title || fb.videoId?.title || ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={fb.rating} />
                      <span className="text-xs text-white/40" suppressHydrationWarning>
                        {(() => { try { return format(parseISO(fb.createdAt), 'MMM dd, yyyy h:mm a'); } catch { return ''; } })()}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mt-2 leading-relaxed">{fb.comment}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(fb._id)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiMessageSquare size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/50 text-sm">No feedback yet</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}