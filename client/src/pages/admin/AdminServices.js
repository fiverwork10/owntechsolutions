import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiCode, FiSmartphone, FiLayout, FiServer, FiCloud, FiDatabase, FiGrid, FiMonitor, FiShield, FiStar, FiArrowRight, FiZap } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

const iconOptions = [
  { value: 'FiCode', label: 'Code', icon: FiCode },
  { value: 'FiSmartphone', label: 'Mobile', icon: FiSmartphone },
  { value: 'FiLayout', label: 'Design', icon: FiLayout },
  { value: 'FiServer', label: 'Server', icon: FiServer },
  { value: 'FiCloud', label: 'Cloud', icon: FiCloud },
  { value: 'FiDatabase', label: 'Database', icon: FiDatabase },
  { value: 'FiGrid', label: 'Grid', icon: FiGrid },
  { value: 'FiMonitor', label: 'Monitor', icon: FiMonitor },
  { value: 'FiShield', label: 'Shield', icon: FiShield },
];

const iconMap = Object.fromEntries(iconOptions.map(o => [o.value, o.icon]));

const colorOptions = ['#8B5CF6', '#A78BFA', '#C084FC', '#6D28D9', '#7C3AED', '#9333EA', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
};

export default function AdminServices() {
  const { API } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', price: '', description: '', features: '', technologies: '', icon: 'FiCode', color: '#8B5CF6', isActive: true, order: 0 });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const res = await API.get('/services');
      return res.data.services || [];
    },
  });

  const resetForm = () => setForm({ title: '', price: '', description: '', features: '', technologies: '', icon: 'FiCode', color: '#8B5CF6', isActive: true, order: 0 });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) {
        const res = await API.put(`/services/${editing}`, data);
        return res.data;
      } else {
        const res = await API.post('/services', data);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      setShowForm(false); setEditing(null); resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, features: form.features.split('\n').map(s => s.trim()).filter(Boolean), technologies: form.technologies.split('\n').map(s => s.trim()).filter(Boolean) };
    saveMutation.mutate(data);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this service?')) return;
    deleteMutation.mutate(id);
  };

  const openEdit = (service) => {
    setEditing(service._id);
    setForm({ title: service.title, price: service.price, description: service.description, features: service.features.join('\n'), technologies: service.technologies.join('\n'), icon: service.icon, color: service.color, isActive: service.isActive, order: service.order });
    setShowForm(true);
  };

  return (
    <AdminLayout title={`Services (${services.length})`}>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }} className="btn-green !py-2 !px-4 !text-sm btn-primary"><FiPlus /> Add Service</button>
      </div>

      <div className="relative mb-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-violet-800/30 to-pink-900/40" />
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/videos/services-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))', backdropFilter: 'blur(2px)' }} />
        <div className="relative z-10 px-8 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#C084FC' }}>
              <FiZap size={12} /> Our Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-20 rounded-full" style={{ background: 'rgba(139,92,246,0.5)', filter: 'blur(50px)' }} />
              </div>
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-extrabold pointer-events-none select-none" style={{ color: 'rgba(139,92,246,0.5)', filter: 'blur(12px)', animation: 'glowPulse 3s ease-in-out infinite' }}>
                Premium Development Services
              </span>
              <span className="bg-clip-text text-transparent relative" style={{ backgroundImage: 'linear-gradient(90deg, #C084FC, #F9A8D4, #67E8F9, #C084FC)', backgroundSize: '300% 100%', animation: 'gradient 6s ease infinite' }}>
                Premium Development Services
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed relative" style={{ animation: 'glowPulse 4s ease-in-out infinite' }}>
              <span className="relative z-10" style={{ textShadow: '0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.2)' }}>
                From concept to deployment, we provide end-to-end development services tailored to your business needs
              </span>
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B0F1A] to-transparent" />
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card card-gradient card-glow mb-8">
          <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-white">{editing ? 'Edit Service' : 'New Service'}</h2><button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center"><FiX /></button></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Service Title" className="input-field" required />
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price (e.g. PKR 40,000+)" className="input-field" required />
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="input-field resize-none" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1&#10;Feature 2" rows={5} className="input-field resize-none" required />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Technologies (one per line)</label>
                <textarea value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React&#10;Node.js" rows={5} className="input-field resize-none" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Icon</label>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field">
                  {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Order / Active</label>
                <div className="flex items-center gap-3">
                  <input value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} type="number" className="input-field !w-20" placeholder="0" />
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'} Service</button>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : services.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
            <FiZap size={32} className="text-purple-400" />
          </div>
          <p className="text-white/50">No services yet</p>
          <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }} className="btn-primary !mt-4 !text-sm"><FiPlus /> Create Your First Service</button>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service, i) => {
            const IconComp = iconMap[service.icon] || FiCode;
            return (
              <motion.div key={service._id} variants={cardVariants} layout className="group relative overflow-visible">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-purple-500/40 via-transparent to-pink-500/40 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
                <div className="relative rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${service.color}12, ${service.color}06)`, border: `1px solid ${service.color}25`, boxShadow: `0 0 30px ${service.color}08, 0 4px 20px rgba(0,0,0,0.2)` }}>
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${service.color}, transparent)` }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300" style={{ background: `${service.color}20`, border: `1px solid ${service.color}30` }}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${service.color}40, transparent)` }} />
                          <IconComp size={22} style={{ color: service.color }} className="relative z-10" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg leading-tight">{service.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold gradient-text">{service.price}</span>
                            {service.isActive && <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full"><FiZap size={8} />Active</span>}
                            {!service.isActive && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Inactive</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => openEdit(service)} className="p-2 rounded-lg glass hover:bg-blue-500/15 text-white/50 hover:text-blue-400 transition-all"><FiEdit2 size={13} /></button>
                        <button onClick={() => handleDelete(service._id)} className="p-2 rounded-lg glass hover:bg-red-500/15 text-white/50 hover:text-red-400 transition-all"><FiTrash2 size={13} /></button>
                      </div>
                    </div>

                    <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-4">{service.description}</p>

                    {service.features?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] uppercase tracking-wider text-white/30 mb-2 font-semibold">Features</p>
                        <div className="space-y-1.5">
                          {service.features.slice(0, 5).map((f, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm">
                              <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${service.color}20`, color: service.color }}>
                                <FiCheck size={9} />
                              </span>
                              <span className="text-white/70">{f}</span>
                            </div>
                          ))}
                          {service.features.length > 5 && (
                            <p className="text-xs text-white/30 pl-6">+{service.features.length - 5} more features</p>
                          )}
                        </div>
                      </div>
                    )}

                    {service.technologies?.length > 0 && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-white/30 mb-2 font-semibold">Technologies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.technologies.slice(0, 6).map((t, j) => (
                            <span key={j} className="px-2 py-1 rounded-lg text-[11px] font-medium" style={{ background: `${service.color}12`, color: service.color, border: `1px solid ${service.color}20` }}>{t}</span>
                          ))}
                          {service.technologies.length > 6 && (
                            <span className="px-2 py-1 rounded-lg text-[11px] text-white/30 glass">+{service.technologies.length - 6}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-white/20">Order: {service.order || 0}</span>
                      <span className="text-xs text-white/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <FiArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AdminLayout>
  );
}
