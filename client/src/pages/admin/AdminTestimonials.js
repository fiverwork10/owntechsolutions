import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar, FiEye, FiUpload } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

export default function AdminTestimonials() {
  const { API } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ clientName: '', company: '', position: '', review: '', rating: 5 });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: async () => {
      const res = await API.get('/testimonials');
      return res.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('clientName', form.clientName);
      fd.append('company', form.company);
      fd.append('position', form.position || '');
      fd.append('review', form.review);
      fd.append('rating', String(form.rating));
      if (photoFile) fd.append('photo', photoFile);
      if (editing) {
        const res = await API.put(`/testimonials/${editing}`, fd);
        return res.data;
      } else {
        const res = await API.post('/testimonials', fd);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ clientName: '', company: '', position: '', review: '', rating: 5 });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    deleteMutation.mutate(id);
  };

  const handleEdit = (t) => {
    setEditing(t._id);
    setForm({ clientName: t.clientName, company: t.company, position: t.position || '', review: t.review, rating: t.rating });
    setPhotoPreview(t.photo || null);
    setPhotoFile(null);
    setShowForm(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <AdminLayout title={`Testimonials (${testimonials.length})`}>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary !py-2 !px-4 !text-sm"><FiPlus /> Add Testimonial</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg glass flex items-center justify-center"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client Name" className="input-field" required />
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="input-field" required />
              </div>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Position (e.g. CEO at TechCorp)" className="input-field" />
              <textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} placeholder="Review" rows={4} className="input-field resize-none" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="text-sm text-white/60 block mb-2">Client Photo</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary !py-2 !px-3 !text-xs">
                      <FiUpload /> {photoPreview ? 'Change' : 'Upload'}
                    </button>
                    {photoPreview && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 text-white/40">No testimonials yet. Click "Add Testimonial" to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {t.photo ? (
                    <img src={t.photo} alt={t.clientName} className="w-full h-full object-cover" />
                  ) : (
                    t.clientName[0]
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{t.clientName}</p>
                  <p className="text-white/50 text-xs truncate">{t.position ? `${t.position}, ` : ''}{t.company}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <FiStar key={j} size={14} className={j < t.rating ? 'text-yellow-500' : 'text-white/30'} fill={j < t.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-white/60 text-sm mb-4 line-clamp-3">"{t.review}"</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <button onClick={() => setViewing(t)} className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1">
                  <FiEye size={12} /> View
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(t)} className="p-2 rounded-lg glass hover:bg-blue-500/10 text-white/70 hover:text-blue-400 transition-all"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg glass hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all"><FiTrash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-strong rounded-3xl p-6 md:p-8 max-w-md w-full relative mx-4 border border-primary/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => setViewing(null)} className="absolute -top-3 -right-3 w-10 h-10 rounded-full glass flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer z-10">
                <FiX />
              </button>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-4 border-2 border-primary/20">
                  {viewing.photo ? (
                    <img src={viewing.photo} alt={viewing.clientName} className="w-full h-full object-cover" />
                  ) : (
                    viewing.clientName[0]
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{viewing.clientName}</h3>
                <p className="text-white/50 text-sm">{viewing.position ? `${viewing.position}, ` : ''}{viewing.company}</p>
              </div>
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <FiStar key={j} size={18} className={j < viewing.rating ? 'text-yellow-500' : 'text-white/30'} fill={j < viewing.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-white/80 leading-relaxed text-center italic">"{viewing.review}"</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}