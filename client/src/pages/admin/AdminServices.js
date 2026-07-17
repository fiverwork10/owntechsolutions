import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiCode, FiSmartphone, FiLayout, FiServer, FiCloud, FiDatabase, FiGrid, FiMonitor, FiShield } from 'react-icons/fi';
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
        <div className="text-center py-20 text-white/50">No services yet</div>
      ) : (
        <div className="space-y-3">
          {services.map((service, i) => {
            const IconComp = iconMap[service.icon] || FiCode;
            return (
              <motion.div key={service._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="card card-gradient card-glow !p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${service.color}20`, border: `1px solid ${service.color}30` }}>
                      <IconComp size={20} style={{ color: service.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-white">{service.title}</h3>
                        <span className="text-xs font-bold gradient-text">{service.price}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${service.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{service.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p className="text-white/60 text-sm mt-1 line-clamp-2">{service.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.features?.slice(0, 4).map((f, j) => <span key={j} className="px-2 py-0.5 rounded text-xs glass text-white/60 flex items-center gap-1"><FiCheck size={10} className="text-primary" />{f}</span>)}
                        {service.features?.length > 4 && <span className="text-xs text-white/40">+{service.features.length - 4}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {service.technologies?.slice(0, 4).map((t, j) => <span key={j} className="px-1.5 py-0.5 rounded text-[10px] glass text-white/40">{t}</span>)}
                        {service.technologies?.length > 4 && <span className="text-[10px] text-white/40">+{service.technologies.length - 4}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(service)} className="p-2 rounded-lg glass hover:bg-blue-500/10 text-white/70 hover:text-blue-400 transition-all"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(service._id)} className="p-2 rounded-lg glass hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
