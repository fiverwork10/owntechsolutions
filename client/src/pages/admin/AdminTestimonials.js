import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

export default function AdminTestimonials() {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ clientName: '', company: '', position: '', review: '', rating: 5 });

  useEffect(() => {
    const fetch = async () => {
      try { const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/testimonials`, { headers: { Authorization: `Bearer ${token}` } }); setTestimonials(res.data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/testimonials/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } });
        setTestimonials(prev => prev.map(t => t._id === editing ? res.data : t));
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/testimonials`, form, { headers: { Authorization: `Bearer ${token}` } });
        setTestimonials(prev => [res.data, ...prev]);
      }
      setShowForm(false); setEditing(null); setForm({ clientName: '', company: '', position: '', review: '', rating: 5 });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try { await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/testimonials/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setTestimonials(prev => prev.filter(t => t._id !== id)); }
    catch (err) { console.error(err); }
  };

  return (
    <AdminLayout title={`Testimonials (${testimonials.length})`}>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ clientName: '', company: '', position: '', review: '', rating: 5 }); }} className="btn-primary !py-2 !px-4 !text-sm"><FiPlus /> Add Testimonial</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card mb-8">
          <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-white">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2><button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center"><FiX /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client Name" className="input-field" required />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="input-field" required />
            </div>
            <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Position (optional)" className="input-field" />
            <textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} placeholder="Review" rows={4} className="input-field resize-none" required />
            <div>
              <label className="text-sm text-white/60 block mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} className={`p-2 rounded-lg transition-all ${form.rating >= r ? 'text-yellow-500' : 'text-white/30'}`}>
                    <FiStar size={24} fill={form.rating >= r ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => <FiStar key={j} size={14} className={j < t.rating ? 'text-yellow-500' : 'text-white/30'} fill={j < t.rating ? 'currentColor' : 'none'} />)}
              </div>
              <p className="text-white/60 text-sm mb-4 line-clamp-3">"{t.review}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white">{t.clientName}</p>
                  <p className="text-white/50 text-xs">{t.company}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(t._id); setForm({ clientName: t.clientName, company: t.company, position: t.position || '', review: t.review, rating: t.rating }); setShowForm(true); }} className="p-2 rounded-lg glass hover:bg-blue-500/10 text-white/70 hover:text-blue-400 transition-all"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg glass hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all"><FiTrash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
