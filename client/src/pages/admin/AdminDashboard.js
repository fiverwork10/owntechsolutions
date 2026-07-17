import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFolder, FiMessageSquare, FiMail, FiBarChart2, FiMessageCircle, FiStar, FiTrendingUp, FiPlayCircle } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { format, parseISO } from 'date-fns';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const COLORS = {
  purple: '#8B5CF6',
  green: '#10B981',
  blue: '#3B82F6',
  amber: '#F59E0B',
  pink: '#EC4899',
  teal: '#14B8A6',
  red: '#EF4444',
  indigo: '#6366F1',
  cyan: '#06B6D4'
};

const pieConfigs = [
  {
    key: 'projects', label: 'Projects', icon: FiFolder,
    data: (s) => [
      { name: 'Published', value: s?.publishedProjects || 0, color: COLORS.green },
      { name: 'Unpublished', value: s?.unpublishedProjects || 0, color: COLORS.red }
    ],
    total: (s) => s?.totalProjects || 0
  },
  {
    key: 'messages', label: 'Messages', icon: FiMessageCircle,
    data: (s) => [
      { name: 'Conversations', value: s?.totalConversations || 0, color: COLORS.blue },
    ],
    total: (s) => s?.totalConversations || 0
  },
  {
    key: 'contacts', label: 'Contacts', icon: FiMail,
    data: (s) => [
      { name: 'Read', value: s?.readContacts || 0, color: COLORS.green },
      { name: 'Unread', value: s?.unreadContacts || 0, color: COLORS.amber }
    ],
    total: (s) => (s?.readContacts || 0) + (s?.unreadContacts || 0)
  },
  {
    key: 'chats', label: 'Active Chats', icon: FiMessageSquare,
    data: (s) => [
      { name: 'Active', value: s?.activeConversations || 0, color: COLORS.pink },
      { name: 'Inactive', value: s?.inactiveConversations || 0, color: COLORS.indigo }
    ],
    total: (s) => (s?.activeConversations || 0) + (s?.inactiveConversations || 0)
  },
  {
    key: 'testimonials', label: 'Testimonials', icon: FiStar,
    data: (s) => [
      { name: 'Active', value: s?.activeTestimonials || 0, color: COLORS.teal },
      { name: 'Inactive', value: s?.inactiveTestimonials || 0, color: COLORS.red }
    ],
    total: (s) => (s?.activeTestimonials || 0) + (s?.inactiveTestimonials || 0)
  },
  {
    key: 'videos', label: 'Videos', icon: FiPlayCircle,
    data: (s) => [
      { name: 'Published', value: s?.publishedVideos || 0, color: COLORS.green },
      { name: 'Unpublished', value: s?.unpublishedVideos || 0, color: COLORS.red }
    ],
    total: (s) => s?.totalVideos || 0
  }
];

function VideoTooltip({ active, payload, stats }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: 'rgba(15,23,42,0.95)' }}>
      <p className="text-sm font-bold text-white" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="text-xs text-white mt-1">Count: <span className="text-white font-bold">{d.value}</span></p>
      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
        <p className="text-xs text-white">Total Views: <span className="text-white font-bold">{stats?.totalVideoViews || 0}</span></p>
        <p className="text-xs text-white">Avg Rating: <span className="text-yellow-400 font-bold">{(stats?.avgVideoRating || 0).toFixed(1)} ★</span></p>
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass p-3 rounded-xl border border-white/10 shadow-xl" style={{ background: 'rgba(15,23,42,0.95)' }}>
      <p className="text-sm font-bold text-white" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="text-xs text-white mt-1">Count: <span className="text-white font-bold">{d.value}</span></p>
      <p className="text-xs text-white" suppressHydrationWarning>Updated {format(new Date(), 'h:mm a')}</p>
    </div>
  );
}

function MessageActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const colors = { open: '#8B5CF6', high: '#10B981', low: '#F59E0B', close: '#EC4899' };
  return (
    <div className="glass p-4 rounded-xl border border-white/10 shadow-xl min-w-[200px]" style={{ background: 'rgba(15,23,42,0.95)' }}>
      <p className="text-xs text-white mb-2" suppressHydrationWarning>
        {(() => { try { return format(parseISO(d.date), 'MMM dd, yyyy'); } catch { return d.date; } })()}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {['open', 'high', 'low', 'close'].map((key) => (
          <React.Fragment key={key}>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full" style={{ background: colors[key] }} /> {key.charAt(0).toUpperCase() + key.slice(1)}:
            </span>
            <span className="text-white font-bold text-right" style={{ color: colors[key] }}>{d[key]}</span>
          </React.Fragment>
        ))}
        {d.volume !== undefined && (
          <>
            <span className="text-white">Volume:</span>
            <span className="text-white font-bold text-right">{d.volume}</span>
          </>
        )}
      </div>
    </div>
  );
}

function PieCard({ config, stats, customTooltip }) {
  const data = config.data(stats);
  const total = config.total(stats);
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))', backdropFilter: 'blur(15px)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 0 25px rgba(239,68,68,0.12), 0 0 50px rgba(239,68,68,0.06)', padding: '1.5rem', borderRadius: '1rem' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs">{config.label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${data[0]?.color || COLORS.purple}20`, border: `1px solid ${data[0]?.color || COLORS.purple}30` }}>
          <config.icon size={16} style={{ color: data[0]?.color || COLORS.purple }} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {data.map((entry, idx) => (
                  <filter key={idx} id={`pie-glow-${config.key}-${idx}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="1.5" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={34}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, idx) => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.color}
                    opacity={hoverIndex === null || hoverIndex === idx ? 1 : 0.4}
                    stroke={hoverIndex === idx ? entry.color : entry.color}
                    strokeWidth={hoverIndex === idx ? 2 : 1}
                    filter={`url(#pie-glow-${config.key}-${idx})`}
                  />
                ))}
              </Pie>
              <ReTooltip content={customTooltip || <PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-white">{total}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-white">{d.name}: <span className="text-white font-medium">{d.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MessageActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
    <div className="card card-glow" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(124,58,237,0.15))', border: '1px solid rgba(139,92,246,0.35)' }}>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-primary" /> Message Activity
        </h2>
        <p className="text-white text-sm py-8 text-center">No message data yet</p>
      </div>
    );
  }

  const colors = {
    open: '#8B5CF6',
    high: '#10B981',
    low: '#F59E0B',
    close: '#EC4899'
  };

  return (
    <div className="card card-glow" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(124,58,237,0.15))', border: '1px solid rgba(139,92,246,0.35)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FiTrendingUp className="text-primary" /> Message Activity
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.open }} /> Open</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.high }} /> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.low }} /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.close }} /> Close</span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {Object.entries(colors).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              tickFormatter={(v) => { try { return format(parseISO(v), 'MM/dd'); } catch { return v; } }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <ReTooltip content={<MessageActivityTooltip />} />
            {Object.entries(colors).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${key})`}
                dot={false}
                activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#0F172A' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-white">
        <span>Open · High · Low · Close</span>
        <span>Last {data.length} days</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { API } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await API.get('/analytics/dashboard');
      return res.data;
    },
  });

  const stats = data?.stats || null;
  const candlestickData = data?.candlestickData || [];
  const recentContacts = data?.recentContacts || [];

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit('join_admin');
    socket.on('dashboard:update', () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    });
    return () => { socket.emit('leave_admin'); socket.disconnect(); };
  }, []);

  if (isLoading) return <AdminLayout title="Dashboard"><div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></AdminLayout>;

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {pieConfigs.map((config) => (
          <PieCard key={config.key} config={config} stats={stats} customTooltip={config.key === 'videos' ? <VideoTooltip stats={stats} /> : undefined} />
        ))}
      </div>

      <div className="mb-8">
        <MessageActivityChart data={candlestickData} />
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-glow">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/projects" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                <FiFolder className="text-white" size={20} />
              </div>
              <span className="text-sm text-white">New Project</span>
            </Link>
            <Link to="/admin/feedback" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                <FiMessageCircle className="text-white" size={20} />
              </div>
              <span className="text-sm text-white">View Feedback</span>
            </Link>
            <Link to="/admin/faqs" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                <FiBarChart2 className="text-white" size={20} />
              </div>
              <span className="text-sm text-white">Manage FAQs</span>
            </Link>
            <Link to="/admin/testimonials" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30">
                <FiStar className="text-white" size={20} />
              </div>
              <span className="text-sm text-white">Testimonials</span>
            </Link>
          </div>
        </div>
        <div className="card card-glow">
          <h2 className="text-lg font-bold text-white mb-4">Recent Contacts</h2>
          {recentContacts.length > 0 ? (
            <div className="space-y-3">
              {recentContacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl glass">
                  <div>
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-white">{contact.subject}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${contact.isRead ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {contact.isRead ? 'Read' : 'New'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white text-sm">No contacts yet</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
