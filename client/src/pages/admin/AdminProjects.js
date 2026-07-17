import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX, FiImage, FiCheck, FiChevronLeft, FiChevronRight, FiExternalLink, FiGithub, FiClock, FiFolder, FiVideo, FiSend, FiStar, FiUser, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FileUploadButton({ inputRef, accept, multiple, onChange, disabled, label, icon: Icon }) {
  const [fileName, setFileName] = useState('');

  return (
    <label className={`relative flex flex-col items-center justify-center w-full min-h-[100px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
      disabled
        ? 'border-gray-700 bg-gray-900/50 opacity-50'
        : 'border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10'
    }`}>
      <div className="flex flex-col items-center gap-2 py-4">
        {Icon && <Icon size={28} className={disabled ? 'text-gray-600' : 'text-primary'} />}
        <span className={`text-sm font-medium ${disabled ? 'text-gray-600' : 'text-text-secondary'}`}>
          {fileName || label || 'Choose files'}
        </span>
        <span className="text-xs text-text-muted">{accept?.replace(/,/g, ', ') || 'All files'}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) {
            const names = Array.from(files).map(f => f.name);
            setFileName(names.length === 1 ? names[0] : `${names.length} files selected`);
          } else {
            setFileName('');
          }
          onChange?.(e);
        }}
        disabled={disabled}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
  );
}

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

export default function AdminProjects() {
  const { API } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <AdminLayout title={activeTab === 'projects' ? `Projects (Admin)` : `Videos (Admin)`}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setActiveTab('projects')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'projects' ? 'btn-primary !py-2.5 !px-5' : 'glass text-text-secondary hover:text-white'}`}>
          <FiImage className="inline mr-1.5" size={16} /> Projects
        </button>
        <button onClick={() => setActiveTab('videos')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'videos' ? 'btn-primary !py-2.5 !px-5' : 'glass text-text-secondary hover:text-white'}`}>
          <FiVideo className="inline mr-1.5" size={16} /> Videos
        </button>
      </div>
      {activeTab === 'projects' ? <ProjectsSection API={API} /> : <VideosSection API={API} />}
    </AdminLayout>
  );
}

function ProjectsSection({ API }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const docRef = useRef(null);
  const [form, setForm] = useState({ name: '', title: '', description: '', category: 'web', tags: '', commentsEnabled: true });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: async () => {
      const res = await API.get('/projects');
      return res.data.projects || [];
    },
  });

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 3000);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('commentsEnabled', form.commentsEnabled);
      formData.append('removedImages', JSON.stringify(removedImageIds));
      form.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => formData.append('tags', t));
      imagePreviews.forEach(p => formData.append('images', p.file));
      if (videoRef.current?.files?.length) {
        Array.from(videoRef.current.files).forEach(f => formData.append('videos', f));
      }
      if (docRef.current?.files?.length) {
        Array.from(docRef.current.files).forEach(f => formData.append('documents', f));
      }
      if (editing) {
        const res = await API.put(`/projects/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      } else {
        const res = await API.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      showFeedback('success', editing ? 'Project updated successfully!' : 'Project created successfully!');
      resetForm();
    },
    onError: (err) => {
      showFeedback('error', err.response?.data?.message || 'Failed to save project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      showFeedback('success', 'Project deleted');
    },
    onError: () => showFeedback('error', 'Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/projects/${id}/toggle-publish`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      showFeedback('success', data.isPublished ? 'Project published!' : 'Project unpublished');
    },
    onError: () => showFeedback('error', 'Toggle failed'),
  });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + imagePreviews.length + files.length;
    if (total > 12) {
      showFeedback('error', `Maximum 12 images allowed. You have ${existingImages.length + imagePreviews.length} already.`);
      e.target.value = '';
      return;
    }
    const previews = files.map(f => ({ file: f, url: URL.createObjectURL(f), id: `new_${Date.now()}_${Math.random()}` }));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewPreview = (id) => {
    setImagePreviews(prev => prev.filter(p => p.id !== id));
  };

  const removeExistingImage = (publicId) => {
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
    setRemovedImageIds(prev => [...prev, publicId]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', title: '', description: '', category: 'web', tags: '', commentsEnabled: true });
    setImagePreviews([]);
    setExistingImages([]);
    setRemovedImageIds([]);
    if (imageRef.current) imageRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
    if (docRef.current) docRef.current.value = '';
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
    deleteMutation.mutate(id);
  };

  const togglePublish = (id) => {
    toggleMutation.mutate(id);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setEditing(project._id);
    setForm({
      name: project.name || '',
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'web',
      tags: project.tags?.join(', ') || '',
      commentsEnabled: project.commentsEnabled !== false
    });
    setExistingImages(project.images || []);
    setImagePreviews([]);
    setRemovedImageIds([]);
    setShowForm(true);
  };

  const totalImages = existingImages.length + imagePreviews.length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <button onClick={openNewForm} className="btn-cyan !py-2 !px-4 !text-sm btn-primary"><FiPlus /> New Project</button>
      </div>

      {feedback.show && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <FiCheck size={16} />
          {feedback.message}
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, scale: 0.9, y: -30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} className="card card-gradient card-glow mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{editing ? 'Edit Project' : 'New Project'}</h2>
            <button onClick={resetForm} className="w-8 h-8 rounded-lg glass flex items-center justify-center"><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project Name" className="input-field" required />
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project Title" className="input-field" required />
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className="input-field resize-none" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="enterprise">Enterprise</option>
                <option value="ui-ux">UI/UX Design</option>
                <option value="api">API Development</option>
                <option value="cloud">Cloud</option>
                <option value="other">Other</option>
              </select>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated: react, node, api)" className="input-field" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.commentsEnabled} onChange={(e) => setForm({ ...form, commentsEnabled: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-secondary">Enable Comments</span>
            </label>

            <div>
              <label className="text-sm text-text-secondary block mb-2">Images ({totalImages}/12) — JPG, PNG, WEBP</label>
              {totalImages > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {existingImages.map((img, i) => (
                    <div key={`exist_${i}`} className="relative group/image w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                      <img src={getFileUrl(img.url)} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                      <button type="button" onClick={() => removeExistingImage(img.publicId)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                        <FiX size={20} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.map((p) => (
                    <div key={p.id} className="relative group/image w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewPreview(p.id)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                        <FiX size={20} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileUploadButton
                inputRef={imageRef}
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={totalImages >= 12}
                label={totalImages >= 12 ? 'Max images reached' : 'Choose images'}
                icon={FiImage}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary block mb-2">Videos (MP4, MOV, AVI)</label>
                <FileUploadButton
                  inputRef={videoRef}
                  accept="video/*"
                  multiple
                  label="Choose videos"
                  icon={FiVideo}
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-2">Documents (PDF, DOC)</label>
                <FileUploadButton
                  inputRef={docRef}
                  accept=".pdf,.doc,.docx"
                  multiple
                  label="Choose documents"
                  icon={FiFolder}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? 'Saving...' : (editing ? 'Update Project' : 'Create Project')}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FiImage size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-secondary text-lg mb-2">No projects yet</p>
          <p className="text-text-muted text-sm">Click "New Project" to create your first project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div key={project._id} initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }} onClick={() => setSelectedProject(project)} className="card card-gradient card-glow group overflow-hidden cursor-pointer">
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-background-card">
                {project.images?.[0]?.url ? (
                  <img src={getFileUrl(project.images[0].url)} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-cyan-500/10"><FiImage className="text-primary/40" size={36} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur ${
                    project.isPublished ? 'bg-green-500/30 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/20' : 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30 shadow-lg shadow-yellow-500/20'
                  }`}>
                    {project.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium glass text-white/90 capitalize backdrop-blur border border-white/10">{project.category}</span>
                {project.images?.length > 1 && (
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-medium glass text-white/80 backdrop-blur">
                    +{project.images.length} photos
                  </span>
                )}
              </div>
              <h3 className="font-bold mb-1 line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">{project.title}</h3>
              <p className="text-text-muted text-xs mb-2">
                {project.name && <>{project.name} • </>}
                {project.views || 0} views
              </p>
              <p className="text-text-secondary text-sm line-clamp-2 mb-4 min-h-[2.5rem]">{project.description}</p>
              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.slice(0, 4).map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 rounded text-[10px] glass text-text-muted">{tag}</span>
                  ))}
                  {project.tags.length > 4 && <span className="text-[10px] text-text-muted">+{project.tags.length - 4}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
                <button onClick={(e) => { e.stopPropagation(); togglePublish(project._id); }} className="flex-1 p-2 rounded-lg glass hover:bg-primary/10 text-text-secondary hover:text-primary transition-all text-xs flex items-center justify-center gap-1.5 group">
                  {project.isPublished ? <><FiEyeOff size={14} /> Unpublish</> : <><FiEye size={14} /> Publish</>}
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEditForm(project); }} className="p-2 rounded-lg glass hover:bg-blue-500/10 text-text-secondary hover:text-blue-400 transition-all"><FiEdit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }} className="p-2 rounded-lg glass hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-all"><FiTrash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    <FiFolder size={12} />
                    <span className="capitalize">{selectedProject.category}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-md ${
                      selectedProject.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedProject.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">{selectedProject.title}</h2>
                  {selectedProject.name && (<p className="text-sm text-white/50 mt-1">{selectedProject.name}</p>)}
                </div>
                <button onClick={() => setSelectedProject(null)}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-secondary hover:text-white shrink-0 ml-4">
                  <FiX />
                </button>
              </div>

              {selectedProject.images?.length > 0 && (
                <div className="mb-6">
                  <Swiper modules={[Navigation, Pagination]} spaceBetween={8} slidesPerView={1}
                    navigation={{ prevEl: '.admin-swiper-prev', nextEl: '.admin-swiper-next' }}
                    pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary' }}
                    className="rounded-xl overflow-hidden ring-2 ring-primary/20">
                    {selectedProject.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-background-card">
                          <img src={getFileUrl(img.url)} alt={`${selectedProject.title} ${i + 1}`}
                            className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button className="admin-swiper-prev w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"><FiChevronLeft size={18} /></button>
                    <span className="text-xs text-white/50">{selectedProject.images.length} image{selectedProject.images.length > 1 ? 's' : ''}</span>
                    <button className="admin-swiper-next w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"><FiChevronRight size={18} /></button>
                  </div>
                </div>
              )}

              <p className="text-text-secondary leading-relaxed mb-6">{selectedProject.description}</p>

              {selectedProject.tags?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-transparent bg-gradient-to-r from-primary to-cyan-400 bg-clip-text mb-3">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, j) => (
                      <span key={j} className="px-3 py-1 rounded-lg text-xs font-medium glass text-text-secondary">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-white/50 mb-6">
                <span className="flex items-center gap-1.5"><FiEye size={14} /> {selectedProject.views || 0} views</span>
                <span className="flex items-center gap-1.5"><FiClock size={14} /> {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                {(selectedProject.liveUrl || selectedProject.githubUrl) && (
                  <>
                    {selectedProject.liveUrl && (
                      <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/30 to-cyan-500/30 border border-primary/30 text-white font-medium hover:from-primary/40 hover:to-cyan-500/40 transition-all text-sm shadow-lg shadow-primary/20">
                        <FiExternalLink size={16} /> Live Demo
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-text-secondary hover:text-white hover:bg-white/10 transition-all text-sm">
                        <FiGithub size={16} /> Source Code
                      </a>
                    )}
                  </>
                )}
                <button onClick={() => { setSelectedProject(null); openEditForm(selectedProject); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-blue btn-primary text-sm ml-auto">
                  <FiEdit2 size={16} /> Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VideosSection({ API }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [form, setForm] = useState({ title: '', description: '', category: 'web', tags: '', commentsEnabled: true });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [fullscreenVideo, setFullscreenVideo] = useState(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['admin', 'videos'],
    queryFn: async () => {
      const res = await API.get('/videos');
      return res.data.videos || [];
    },
  });

  const { data: commentsData } = useQuery({
    queryKey: ['admin', 'video-comments', selectedVideo?._id],
    queryFn: async () => {
      if (!selectedVideo?._id) return { comments: [], stats: { average: 0, count: 0 } };
      const res = await API.get(`/comments/video/${selectedVideo._id}`);
      return res.data;
    },
    enabled: !!selectedVideo?._id,
  });

  const comments = commentsData?.comments || [];
  const ratingStats = commentsData?.stats || { average: 0, count: 0 };

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 3000);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing && !videoFile) {
        throw new Error('Please select a video file');
      }
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('commentsEnabled', form.commentsEnabled);
      form.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => formData.append('tags', t));
      if (videoFile) formData.append('video', videoFile);

      if (editing) {
        const res = await API.put(`/videos/${editing}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      } else {
        const res = await API.post('/videos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      showFeedback('success', editing ? 'Video updated successfully!' : 'Video uploaded successfully!');
      resetForm();
    },
    onError: (err) => {
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to save video');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      showFeedback('success', 'Video deleted');
    },
    onError: () => showFeedback('error', 'Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/videos/${id}/toggle-publish`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      showFeedback('success', data.isPublished ? 'Video published!' : 'Video unpublished');
    },
    onError: () => showFeedback('error', 'Toggle failed'),
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      showFeedback('error', 'Video too large. Maximum size is 1GB.');
      e.target.value = '';
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', description: '', category: 'web', tags: '', commentsEnabled: true });
    setVideoFile(null);
    setVideoPreview('');
  };

  const openNewForm = () => { resetForm(); setShowForm(true); };

  const openEditForm = (video) => {
    setEditing(video._id);
    setForm({
      title: video.title || '',
      description: video.description || '',
      category: video.category || 'web',
      tags: video.tags?.join(', ') || '',
      commentsEnabled: video.commentsEnabled !== false
    });
    setVideoFile(null);
    setVideoPreview(getFileUrl(video.url));
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this video permanently?')) return;
    deleteMutation.mutate(id);
  };

  const togglePublish = (id) => {
    toggleMutation.mutate(id);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-secondary">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
        <button onClick={openNewForm} className="btn-pink !py-2 !px-4 !text-sm btn-primary"><FiPlus /> Add Video</button>
      </div>

      {feedback.show && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <FiCheck size={16} />
          {feedback.message}
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, scale: 0.9, y: -30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} className="card card-gradient card-glow mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">{editing ? 'Edit Video' : 'Add New Video'}</h2>
            <button onClick={resetForm} className="w-8 h-8 rounded-lg glass flex items-center justify-center"><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video Title *" className="input-field" required />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className="input-field resize-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="enterprise">Enterprise</option>
                <option value="ui-ux">UI/UX Design</option>
                <option value="api">API Development</option>
                <option value="cloud">Cloud</option>
                <option value="other">Other</option>
              </select>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="input-field" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.commentsEnabled} onChange={(e) => setForm({ ...form, commentsEnabled: e.target.checked })} className="accent-primary w-4 h-4" />
              <span className="text-sm text-text-secondary">Enable Comments</span>
            </label>
            <div>
              <label className="text-sm text-text-secondary block mb-2">
                Video File {editing ? '(leave empty to keep existing)' : '* (MP4, MOV, WebM — up to 1GB)'}
              </label>
              {videoPreview && (
                <div className="mb-3 rounded-xl overflow-hidden bg-black max-h-48">
                  <video src={videoPreview} controls className="w-full h-full max-h-48" />
                </div>
              )}
              <FileUploadButton
                accept="video/*"
                label={editing ? 'Choose new video file' : 'Choose video file'}
                icon={FiVideo}
                onChange={handleFileSelect}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                {saveMutation.isPending ? 'Saving...' : (editing ? 'Update Video' : 'Upload Video')}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <FiVideo size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-secondary text-lg mb-2">No videos yet</p>
          <p className="text-text-muted text-sm">Click "Add Video" to upload your first video</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <motion.div key={video._id} initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
              className="card card-gradient card-glow group overflow-hidden cursor-pointer" onClick={() => setSelectedVideo(video)}>
              <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-black flex items-center justify-center">
                <video src={getFileUrl(video.url)} className="w-full h-full object-cover" muted
                  onMouseEnter={(e) => e.target.play().catch(() => {})}
                  onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500/40 to-purple-500/40 backdrop-blur flex items-center justify-center border border-white/20 shadow-lg shadow-pink-500/20">
                    <FiVideo size={24} className="text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur ${
                    video.isPublished ? 'bg-green-500/30 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/20' : 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30 shadow-lg shadow-yellow-500/20'
                  }`}>
                    {video.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium glass text-white/90 capitalize backdrop-blur border border-white/10">{video.category}</span>
              </div>
              <h3 className="font-bold mb-1 line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-300">{video.title}</h3>
              <p className="text-text-muted text-xs mb-2">{video.views || 0} views</p>
              <p className="text-text-secondary text-sm line-clamp-2 mb-4 min-h-[2.5rem]">{video.description || 'No description'}</p>
              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {video.tags.slice(0, 4).map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 rounded text-[10px] glass text-text-muted">{tag}</span>
                  ))}
                  {video.tags.length > 4 && <span className="text-[10px] text-text-muted">+{video.tags.length - 4}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
                <button onClick={(e) => { e.stopPropagation(); togglePublish(video._id); }} className="flex-1 p-2 rounded-lg glass hover:bg-primary/10 text-text-secondary hover:text-primary transition-all text-xs flex items-center justify-center gap-1.5">
                  {video.isPublished ? <><FiEyeOff size={14} /> Unpublish</> : <><FiEye size={14} /> Publish</>}
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEditForm(video); }} className="p-2 rounded-lg glass hover:bg-blue-500/10 text-text-secondary hover:text-blue-400 transition-all"><FiEdit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(video._id); }} className="p-2 rounded-lg glass hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-all"><FiTrash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                    <FiVideo size={12} />
                    <span className="capitalize">{selectedVideo.category}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-md ${selectedVideo.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {selectedVideo.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                </div>
                <button onClick={() => setSelectedVideo(null)}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-secondary hover:text-white shrink-0 ml-4">
                  <FiX />
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black mb-4">
                <video src={getFileUrl(selectedVideo.url)} controls className="w-full max-h-[50vh]" />
                <button onClick={(e) => { e.stopPropagation(); setFullscreenVideo(selectedVideo.url); }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white transition-all">
                  <FiMaximize2 size={18} />
                </button>
              </div>

              <p className="text-text-secondary text-sm mb-4">{selectedVideo.description || 'No description'}</p>

              {selectedVideo.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedVideo.tags.map((tag, j) => (
                    <span key={j} className="px-3 py-1 rounded-lg text-xs font-medium glass text-text-secondary">{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                <span className="flex items-center gap-1.5"><FiEye size={14} /> {selectedVideo.views || 0} views</span>
                <span className="flex items-center gap-1.5"><FiClock size={14} /> {new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="border-t border-glass-border pt-4">
                {ratingStats.count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar key={s} size={14} className={s <= Math.round(ratingStats.average) ? 'text-yellow-400' : 'text-gray-600'}
                          fill={s <= Math.round(ratingStats.average) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <span>{ratingStats.average.toFixed(1)} ({ratingStats.count} reviews)</span>
                  </div>
                )}
                {comments.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4">
                    {comments.map((c) => (
                      <div key={c._id} className="p-3 rounded-xl glass">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-[10px] font-bold">{c.userName[0]}</div>
                            <span className="font-medium text-xs">{c.userName}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FiStar key={s} size={10} className={s <= c.rating ? 'text-yellow-400' : 'text-gray-600'}
                                fill={s <= c.rating ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-text-secondary text-xs">{c.comment}</p>
                        <p className="text-text-muted text-[10px] mt-1 flex items-center gap-1"><FiClock size={10} /> {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setSelectedVideo(null); openEditForm(selectedVideo); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-blue-400 hover:bg-blue-500/10 transition-all text-sm">
                    <FiEdit2 size={16} /> Edit
                  </button>
                  <button onClick={() => { setSelectedVideo(null); handleDelete(selectedVideo._id); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-red-400 hover:bg-red-500/10 transition-all text-sm">
                    <FiTrash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black flex items-center justify-center"
            onClick={() => setFullscreenVideo(null)}
          >
            <button onClick={() => setFullscreenVideo(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-xl glass flex items-center justify-center text-white z-10">
              <FiMinimize2 size={24} />
            </button>
            <video src={getFileUrl(fullscreenVideo)} controls autoPlay className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
