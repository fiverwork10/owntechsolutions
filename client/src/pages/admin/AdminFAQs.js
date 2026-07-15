import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const categoryOptions = ['mern', 'mobile', 'flutter', 'react', 'nodejs', 'mongodb', 'aspnet', 'ui-ux', 'pricing', 'hosting', 'deployment', 'maintenance', 'security', 'seo', 'timelines', 'general'];

export default function AdminFAQs() {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', tags: '' });

  const fetchFAQs = async () => {
    try { const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faqs`, { headers: { Authorization: `Bearer ${token}` } }); setFaqs(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFAQs(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        const res = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faqs/${editing}`, data, { headers: { Authorization: `Bearer ${token}` } });
        setFaqs(prev => prev.map(f => f._id === editing ? res.data : f));
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faqs`, data, { headers: { Authorization: `Bearer ${token}` } });
        setFaqs(prev => [res.data, ...prev]);
      }
      setShowForm(false); setEditing(null); setForm({ question: '', answer: '', category: 'general', tags: '' });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try { await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/faqs/${id}`, { headers: { Authorization: `Bearer ${token}` } }); setFaqs(prev => prev.filter(f => f._id !== id)); }
    catch (err) { console.error(err); }
  };

  return (
    <AdminLayout title={`FAQs (${faqs.length})`}>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ question: '', answer: '', category: 'general', tags: '' }); }} className="btn-primary !py-2 !px-4 !text-sm"><FiPlus /> Add FAQ</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card mb-8">
          <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-white">{editing ? 'Edit FAQ' : 'New FAQ'}</h2><button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center"><FiX /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Question" className="input-field" required />
            <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Answer" rows={4} className="input-field resize-none" required />
            <div className="grid grid-cols-2 gap-4">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="input-field" />
            </div>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} FAQ</button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={faq._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="card !p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs text-primary font-medium">{faq.category}</span>
                  <h3 className="font-medium text-white mt-1">{faq.question}</h3>
                  <p className="text-white/60 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                  {faq.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {faq.tags.map((t, j) => <span key={j} className="px-2 py-0.5 rounded text-xs glass text-white/50">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditing(faq._id); setForm({ question: faq.question, answer: faq.answer, category: faq.category, tags: faq.tags?.join(', ') || '' }); setShowForm(true); }} className="p-2 rounded-lg glass hover:bg-blue-500/10 text-white/70 hover:text-blue-400 transition-all"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(faq._id)} className="p-2 rounded-lg glass hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all"><FiTrash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
