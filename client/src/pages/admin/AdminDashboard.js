import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFolder, FiMessageSquare, FiMail, FiBarChart2, FiMessageCircle, FiStar, FiTrendingUp, FiPlayCircle } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { format, parseISO } from 'date-fns';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ComposedChart, Line, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      <p className="text-xs text-white/70 mt-1">Count: <span className="text-white font-bold">{d.value}</span></p>
      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
        <p className="text-xs text-white/70">Total Views: <span className="text-white font-bold">{stats?.totalVideoViews || 0}</span></p>
        <p className="text-xs text-white/70">Avg Rating: <span className="text-yellow-400 font-bold">{(stats?.avgVideoRating || 0).toFixed(1)} ★</span></p>
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
      <p className="text-xs text-white/70 mt-1">Count: <span className="text-white font-bold">{d.value}</span></p>
      <p className="text-xs text-white/40" suppressHydrationWarning>Updated {format(new Date(), 'h:mm a')}</p>
    </div>
  );
}

function CandleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const isGreen = d.close >= d.open;
  return (
    <div className="glass p-4 rounded-xl border border-white/10 shadow-xl min-w-[200px]" style={{ background: 'rgba(15,23,42,0.95)' }}>
      <p className="text-xs text-white/50 mb-2" suppressHydrationWarning>
        {(() => { try { return format(parseISO(d.date), 'MMM dd, yyyy'); } catch { return d.date; } })()}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-white/50">Open:</span>
        <span className="text-white font-bold text-right">{d.open}</span>
        <span className="text-white/50">Close:</span>
        <span className={`font-bold text-right ${isGreen ? 'text-green-400' : 'text-red-400'}`}>{d.close}</span>
        <span className="text-white/50">High:</span>
        <span className="text-white font-bold text-right">{d.high}</span>
        <span className="text-white/50">Low:</span>
        <span className="text-white font-bold text-right">{d.low}</span>
        <span className="text-white/50">Volume:</span>
        <span className="text-white font-bold text-right">{d.volume}</span>
        <span className="text-white/50">Change:</span>
        <span className={`font-bold text-right ${isGreen ? 'text-green-400' : 'text-red-400'}`}>
          {d.open > 0 ? `${((d.close - d.open) / d.open * 100).toFixed(2)}%` : '0.00%'}
        </span>
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
      className="card"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-xs">{config.label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${data[0]?.color || COLORS.purple}20`, border: `1px solid ${data[0]?.color || COLORS.purple}30` }}>
          <config.icon size={16} style={{ color: data[0]?.color || COLORS.purple }} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
                    stroke={hoverIndex === idx ? entry.color : 'transparent'}
                    strokeWidth={hoverIndex === idx ? 2 : 0}
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
                <span className="text-xs text-white/60">{d.name}: <span className="text-white/90 font-medium">{d.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Candlestick({ x, y, width, height, payload }) {
  if (!payload) return null;
  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? COLORS.green : COLORS.red;
  const scale = height / (Math.max(high, low, open, close, 1) * 1.3);
  const candleY = y + (Math.max(high, low, open, close) - Math.max(open, close)) * scale;
  const candleHeight = Math.abs(open - close) * scale || 1;
  const wickTop = y + (Math.max(high, low, open, close) - high) * scale;
  const wickBottom = y + (Math.max(high, low, open, close) - low) * scale;

  return (
    <g>
      <line x1={x + width / 2} x2={x + width / 2} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={1.5} />
      <rect x={x + width * 0.15} y={candleY} width={width * 0.7} height={Math.max(candleHeight, 1)} fill={color} rx={1} />
    </g>
  );
}

function CandlestickChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-primary" /> Message Activity (OHLC)
        </h2>
        <p className="text-white/50 text-sm py-8 text-center">No message data yet for candlestick visualization</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap(d => [d.high, d.low, d.open, d.close]), 1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FiTrendingUp className="text-primary" /> Message Activity (OHLC)
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> Bullish</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Bearish</span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              tickFormatter={(v) => { try { return format(parseISO(v), 'MM/dd'); } catch { return v; } }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, maxVal * 1.3]}
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <ReTooltip content={<CandleTooltip />} />
            <Bar
              dataKey="high"
              shape={(props) => <Candlestick {...props} />}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
        <span>Open · High · Low · Close</span>
        <span>Last 7 days</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [candlestickData, setCandlestickData] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setCandlestickData(res.data.candlestickData || []);
      setRecentContacts(res.data.recentContacts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.emit('join_admin');
    socket.on('dashboard:update', (data) => {
      if (data.stats) setStats(prev => ({ ...prev, ...data.stats }));
      if (data.candlestickData) setCandlestickData(data.candlestickData);
    });
    return () => { socket.emit('leave_admin'); socket.disconnect(); };
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></AdminLayout>;

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {pieConfigs.map((config) => (
          <PieCard key={config.key} config={config} stats={stats} customTooltip={config.key === 'videos' ? <VideoTooltip stats={stats} /> : undefined} />
        ))}
      </div>

      <div className="mb-8">
        <CandlestickChart data={candlestickData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/projects" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center">
              <FiFolder className="mx-auto mb-2 text-primary" size={24} />
              <span className="text-sm text-white">New Project</span>
            </Link>
            <Link to="/admin/feedback" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center">
              <FiMessageCircle className="mx-auto mb-2 text-primary" size={24} />
              <span className="text-sm text-white">View Feedback</span>
            </Link>
            <Link to="/admin/faqs" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center">
              <FiBarChart2 className="mx-auto mb-2 text-primary" size={24} />
              <span className="text-sm text-white">Manage FAQs</span>
            </Link>
            <Link to="/admin/testimonials" className="p-4 rounded-xl glass hover:bg-primary/10 transition-all text-center">
              <FiStar className="mx-auto mb-2 text-primary" size={24} />
              <span className="text-sm text-white">Testimonials</span>
            </Link>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">Recent Contacts</h2>
          {recentContacts.length > 0 ? (
            <div className="space-y-3">
              {recentContacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl glass">
                  <div>
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-white/50">{contact.subject}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${contact.isRead ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {contact.isRead ? 'Read' : 'New'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm">No contacts yet</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
