import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FiSearch, FiX, FiExternalLink, FiGithub, FiImage, FiVideo, FiStar, FiSend, FiUser, FiClock, FiChevronLeft, FiChevronRight, FiMaximize2, FiMinimize2, FiEye, FiPlay } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { io } from 'socket.io-client';
import axios from 'axios';
import AnimatedCounter from '../components/AnimatedCounter';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_URL;

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

const categories = ['all', 'web', 'mobile', 'enterprise', 'ui-ux', 'api', 'cloud'];

const categoryLabels = {
  all: 'All Projects', web: 'Web Development', mobile: 'Mobile Apps',
  enterprise: 'Enterprise', 'ui-ux': 'UI/UX Design', api: 'API Development', cloud: 'Cloud'
};

function ProjectCard3D({ project, index, onClick, views }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateX: 15, y: 60, z: -100 }}
      animate={inView ? { opacity: 1, rotateX: 0, y: 0, z: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="card group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-background-card">
        {project.images?.[0] ? (
          <img src={getFileUrl(project.images[0].url)} alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><FiImage className="text-text-muted" size={40} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-sm font-medium">Click to view</span>
        </div>
        <span className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-medium glass text-primary">
          {categoryLabels[project.category] || project.category}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
      <p className="text-text-secondary text-sm line-clamp-2 mb-3">{project.description}</p>
      <p className="text-text-muted text-xs mb-2 flex items-center gap-1.5"><FiEye size={12} /> <AnimatedCounter value={views} /> views</p>
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag, j) => (
            <span key={j} className="px-2 py-0.5 rounded-md text-xs glass text-text-muted">{tag}</span>
          ))}
          {project.tags.length > 3 && <span className="text-xs text-text-muted">+{project.tags.length - 3}</span>}
        </div>
      )}
    </motion.div>
  );
}

function VideoCard3D({ video, index, onClick, views }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, rotateX: 15, y: 60, z: -100 }}
      animate={inView ? { opacity: 1, rotateX: 0, y: 0, z: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="card group cursor-pointer overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-black flex items-center justify-center">
        <video src={getFileUrl(video.url)} className="w-full h-full object-cover" muted
          ref={(el) => { if (el) hovered ? el.play().catch(() => {}) : (el.pause(), el.currentTime = 0); }} />
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hovered ? 'bg-black/40' : 'bg-black/30'}`}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          >
            <FiPlay size={28} className="text-white ml-1" />
          </motion.div>
        </div>
        {!hovered && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-medium glass text-primary">
            {categoryLabels[video.category] || video.category}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{video.title}</h3>
      <p className="text-text-muted text-xs mb-2 flex items-center gap-1.5"><FiEye size={12} /> <AnimatedCounter value={views} /> views</p>
      <p className="text-text-secondary text-sm line-clamp-2 mb-3">{video.description || 'No description'}</p>
      {video.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {video.tags.slice(0, 3).map((tag, j) => (
            <span key={j} className="px-2 py-0.5 rounded-md text-xs glass text-text-muted">{tag}</span>
          ))}
          {video.tags.length > 3 && <span className="text-xs text-text-muted">+{video.tags.length - 3}</span>}
        </div>
      )}
    </motion.div>
  );
}

export default function Projects() {
  const [activeView, setActiveView] = useState('projects');

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Our Portfolio</span>
          <h1 className="section-title mt-4">Featured Projects</h1>
          <p className="section-subtitle">Showcasing our best work across various technologies and industries</p>
        </motion.div>

        <div className="flex items-center gap-2 mb-8 justify-center">
          <button onClick={() => setActiveView('projects')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeView === 'projects' ? 'bg-primary text-white shadow-neon' : 'glass text-text-secondary hover:text-white'}`}>
            <FiImage className="inline mr-1.5" size={16} /> Projects
          </button>
          <button onClick={() => setActiveView('videos')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeView === 'videos' ? 'bg-primary text-white shadow-neon' : 'glass text-text-secondary hover:text-white'}`}>
            <FiVideo className="inline mr-1.5" size={16} /> Videos
          </button>
        </div>

        {activeView === 'projects' ? <ProjectsView /> : <VideosView />}
      </div>
    </div>
  );
}

function StarInput({ rating, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          className={`p-1 transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>
          <FiStar size={22} fill={star <= rating ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function ProjectsView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectViews, setProjectViews] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [showReviews, setShowReviews] = useState(true);
  const [commentForm, setCommentForm] = useState({ userName: '', email: '', comment: '', rating: 5 });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('view:update', (data) => {
      if (data.type === 'project') {
        setProjects(prev => prev.map(p => p._id === data.id ? { ...p, views: data.views } : p));
        setProjectViews(prev => ({ ...prev, [data.id]: data.views }));
      }
    });
    socket.on('comment:new', (data) => {
      if (data.type === 'project') {
        if (data.id === selectedProject?._id) {
          setComments(prev => [data.comment, ...prev]);
          setRatingStats(data.stats);
        }
      }
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (search) params.search = search;
        const res = await axios.get(`${API_URL}/api/projects`, { params });
        setProjects(res.data.projects || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProjects();
  }, [activeCategory, search]);

  const openProject = useCallback(async (project) => {
    setSelectedProject(project);
    try {
      const res = await axios.get(`${API_URL}/api/projects/${project._id}`);
      setSelectedProject(res.data);
      setProjectViews(prev => ({ ...prev, [project._id]: res.data.views }));
    } catch {}
    try {
      const res = await axios.get(`${API_URL}/api/comments/project/${project._id}`);
      setComments(res.data.comments || []);
      setRatingStats(res.data.stats || { average: 0, count: 0 });
    } catch {}
    setCommentForm({ userName: '', email: '', comment: '', rating: 5 });
    setCommentMsg('');
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.userName.trim() || !commentForm.comment.trim()) return;
    setSubmittingComment(true);
    try {
      await axios.post(`${API_URL}/api/comments`, {
        projectId: selectedProject._id,
        userName: commentForm.userName.trim(),
        email: commentForm.email.trim(),
        comment: commentForm.comment.trim(),
        rating: commentForm.rating
      });
      setCommentMsg('Thank you for your review!');
      setCommentForm({ userName: '', email: '', comment: '', rating: 5 });
      const refreshed = await axios.get(`${API_URL}/api/comments/project/${selectedProject._id}`);
      setComments(refreshed.data.comments || []);
      setRatingStats(refreshed.data.stats || { average: 0, count: 0 });
    } catch (err) {
      setCommentMsg('Failed to submit review. Please try again.');
    } finally { setSubmittingComment(false); }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..." className="input-field pl-12" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-neon'
                  : 'glass text-text-secondary hover:text-white hover:bg-primary/10'
              }`}>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse h-80">
              <div className="w-full h-48 rounded-xl bg-background-card mb-4" />
              <div className="h-4 bg-background-card rounded w-3/4 mb-2" />
              <div className="h-3 bg-background-card rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary text-xl">No projects found</p>
          <p className="text-text-muted mt-2">Check back soon for our latest work</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard3D key={project._id} project={project} index={i}
              onClick={() => openProject(project)}
              views={projectViews[project._id] ?? project.views ?? 0}
            />
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
              className="glass-strong rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                    <span className="flex items-center gap-1.5"><FiEye size={13} /> <AnimatedCounter value={selectedProject.views ?? 0} /> views</span>
                    {ratingStats.count > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} size={14} className={s <= Math.round(ratingStats.average) ? 'text-yellow-400' : 'text-gray-600'}
                            fill={s <= Math.round(ratingStats.average) ? 'currentColor' : 'none'} />
                        ))}
                        <span className="ml-1">{ratingStats.average.toFixed(1)} ({ratingStats.count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedProject(null)}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-secondary hover:text-white">
                  <FiX />
                </button>
              </div>

              {selectedProject.images?.length > 0 && (
                <div className="mb-6">
                  <Swiper modules={[Navigation, Pagination]} spaceBetween={8} slidesPerView={1}
                    navigation={{ prevEl: '.swiper-prev', nextEl: '.swiper-next' }}
                    pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary' }}
                    className="rounded-xl overflow-hidden">
                    {selectedProject.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="relative h-64 md:h-80 cursor-pointer" onClick={() => setLightbox({ type: 'image', url: img.url, index: i })}>
                          <img src={getFileUrl(img.url)} alt={`${selectedProject.title} ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                            <span className="text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Click to view</span>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button className="swiper-prev w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"><FiChevronLeft size={18} /></button>
                    <span className="text-xs text-white/50">{selectedProject.images.length} image{selectedProject.images.length > 1 ? 's' : ''}</span>
                    <button className="swiper-next w-9 h-9 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"><FiChevronRight size={18} /></button>
                  </div>
                </div>
              )}
              <p className="text-text-secondary mb-6">{selectedProject.description}</p>

              {selectedProject.videos?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-primary mb-3">Videos:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.videos.map((v, i) => (
                      <button key={i} onClick={() => setLightbox({ type: 'video', url: v.url })}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-text-secondary hover:text-primary transition-colors">
                        <FiVideo /> Video {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(selectedProject.liveUrl || selectedProject.githubUrl) && (
                <div className="flex gap-4 mb-6">
                  {selectedProject.liveUrl && <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="btn-primary !py-2.5 !text-sm"><FiExternalLink /> Live Demo</a>}
                  {selectedProject.githubUrl && <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary !py-2.5 !text-sm"><FiGithub /> Source Code</a>}
                </div>
              )}

              <div className="border-t border-glass-border pt-6">
                <button onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center justify-between w-full text-left mb-4 group">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Reviews & Ratings</h3>
                  <span className="text-sm text-primary px-3 py-1 rounded-lg glass">
                    {showReviews ? 'Hide Reviews' : `Show Reviews (${comments.length})`}
                  </span>
                </button>
                {showReviews && (
                <>
                  {comments.length > 0 && (
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                      {comments.map((c) => (
                        <div key={c._id} className="p-4 rounded-xl glass">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold">{c.userName[0]}</div>
                              <span className="font-medium text-sm">{c.userName}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FiStar key={s} size={12} className={s <= c.rating ? 'text-yellow-400' : 'text-gray-600'}
                                  fill={s <= c.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </div>
                          <p className="text-text-secondary text-sm">{c.comment}</p>
                          <p className="text-text-muted text-xs mt-2 flex items-center gap-1"><FiClock size={10} /> {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProject.commentsEnabled !== false && (
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      {commentMsg && (
                        <div className={`p-3 rounded-xl text-sm ${
                          commentMsg.includes('Thank you')
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>{commentMsg}</div>
                      )}
                      <div>
                        <label className="text-sm text-text-secondary block mb-1">Your Rating</label>
                        <StarInput rating={commentForm.rating} onChange={(r) => setCommentForm({ ...commentForm, rating: r })} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input value={commentForm.userName} onChange={(e) => setCommentForm({ ...commentForm, userName: e.target.value })}
                          placeholder="Your Name *" required className="input-field" />
                        <input value={commentForm.email} onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                          placeholder="Your Email (optional)" type="email" className="input-field" />
                      </div>
                      <textarea value={commentForm.comment} onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                        placeholder="Write your review... *" required rows={3} className="input-field resize-none" />
                      <button type="submit" disabled={submittingComment} className="btn-primary">
                        <FiSend /> {submittingComment ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && !lightbox.fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            {lightbox.type === 'image' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateX: -10 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateX: -10 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="glass-strong rounded-3xl overflow-hidden max-w-3xl w-full max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img src={getFileUrl(lightbox.url)} alt="" className="w-full max-h-[60vh] object-contain bg-black/50 cursor-pointer"
                    onClick={() => setLightbox({ ...lightbox, fullscreen: true })} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setLightbox({ ...lightbox, fullscreen: true })}
                      className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white hover:text-white/80 transition-all">
                      <FiMaximize2 size={16} />
                    </button>
                    <button onClick={() => setLightbox(null)}
                      className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white hover:text-white/80 transition-all">
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{selectedProject?.title}</h3>
                  <p className="text-sm text-white/50 mt-1">{selectedProject?.images?.length} image{selectedProject?.images?.length > 1 ? 's' : ''} · Image {lightbox.index + 1}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setLightbox(null)}
                  className="absolute -top-4 -right-4 w-12 h-12 rounded-xl glass flex items-center justify-center text-white z-10">
                  <FiX size={24} />
                </button>
                <video src={getFileUrl(lightbox.url)} controls autoPlay className="w-full max-h-[85vh] rounded-2xl"
                  onClick={(e) => e.stopPropagation()} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox?.fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setLightbox({ type: 'image', url: lightbox.url, index: lightbox.index })}
                className="absolute top-4 right-4 w-12 h-12 rounded-xl glass flex items-center justify-center text-white z-10">
                <FiMinimize2 size={22} />
              </button>
              <img src={getFileUrl(lightbox.url)} alt="" className="max-w-full max-h-[92vh] object-contain rounded-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VideosView() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoViews, setVideoViews] = useState({});
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [showReviews, setShowReviews] = useState(true);
  const [commentForm, setCommentForm] = useState({ userName: '', email: '', comment: '', rating: 5 });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('view:update', (data) => {
      if (data.type === 'video') {
        setVideos(prev => prev.map(v => v._id === data.id ? { ...v, views: data.views } : v));
        setVideoViews(prev => ({ ...prev, [data.id]: data.views }));
      }
    });
    socket.on('comment:new', (data) => {
      if (data.type === 'video') {
        if (data.id === selectedVideo?._id) {
          setComments(prev => [data.comment, ...prev]);
          setRatingStats(data.stats);
        }
      }
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (search) params.search = search;
        const res = await axios.get(`${API_URL}/api/videos`, { params });
        setVideos(res.data.videos || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [activeCategory, search]);

  const openVideo = useCallback(async (video) => {
    setSelectedVideo(video);
    try {
      const res = await axios.get(`${API_URL}/api/videos/${video._id}`);
      setSelectedVideo(res.data);
      setVideoViews(prev => ({ ...prev, [video._id]: res.data.views }));
    } catch {}
    try {
      const res = await axios.get(`${API_URL}/api/comments/video/${video._id}`);
      setComments(res.data.comments || []);
      setRatingStats(res.data.stats || { average: 0, count: 0 });
    } catch {}
    setCommentForm({ userName: '', email: '', comment: '', rating: 5 });
    setCommentMsg('');
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.userName.trim() || !commentForm.comment.trim()) return;
    setSubmittingComment(true);
    try {
      await axios.post(`${API_URL}/api/comments`, {
        videoId: selectedVideo._id,
        userName: commentForm.userName.trim(),
        email: commentForm.email.trim(),
        comment: commentForm.comment.trim(),
        rating: commentForm.rating
      });
      setCommentMsg('Thank you for your review!');
      setCommentForm({ userName: '', email: '', comment: '', rating: 5 });
      const refreshed = await axios.get(`${API_URL}/api/comments/video/${selectedVideo._id}`);
      setComments(refreshed.data.comments || []);
      setRatingStats(refreshed.data.stats || { average: 0, count: 0 });
    } catch (err) {
      setCommentMsg('Failed to submit review. Please try again.');
    } finally { setSubmittingComment(false); }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..." className="input-field pl-12" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-neon'
                  : 'glass text-text-secondary hover:text-white hover:bg-primary/10'
              }`}>
              {cat === 'all' ? 'All Videos' : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse h-80">
              <div className="w-full h-48 rounded-xl bg-background-card mb-4" />
              <div className="h-4 bg-background-card rounded w-3/4 mb-2" />
              <div className="h-3 bg-background-card rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <FiVideo size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-secondary text-xl">No videos yet</p>
          <p className="text-text-muted mt-2">Check back soon for our latest videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <VideoCard3D key={video._id} video={video} index={i}
              onClick={() => openVideo(video)}
              views={videoViews[video._id] ?? video.views ?? 0}
            />
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
                  <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                  {ratingStats.count > 0 && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} size={14} className={s <= Math.round(ratingStats.average) ? 'text-yellow-400' : 'text-gray-600'}
                            fill={s <= Math.round(ratingStats.average) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span>{ratingStats.average.toFixed(1)} ({ratingStats.count} reviews)</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedVideo(null)}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-secondary hover:text-white">
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
                <span className="flex items-center gap-1.5"><FiEye size={14} /> <AnimatedCounter value={selectedVideo.views ?? 0} /> views</span>
                <span className="flex items-center gap-1.5"><FiClock size={14} /> {new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="border-t border-glass-border pt-4">
                <button onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center justify-between w-full text-left mb-4 group">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Reviews & Ratings</h3>
                  <span className="text-sm text-primary px-3 py-1 rounded-lg glass">
                    {showReviews ? 'Hide Reviews' : `Show Reviews (${comments.length})`}
                  </span>
                </button>
                {showReviews && (
                <>
                  {comments.length > 0 && (
                    <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
                      {comments.map((c) => (
                        <div key={c._id} className="p-4 rounded-xl glass">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold">{c.userName[0]}</div>
                              <span className="font-medium text-sm">{c.userName}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FiStar key={s} size={12} className={s <= c.rating ? 'text-yellow-400' : 'text-gray-600'}
                                  fill={s <= c.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </div>
                          <p className="text-text-secondary text-sm">{c.comment}</p>
                          <p className="text-text-muted text-xs mt-2 flex items-center gap-1"><FiClock size={10} /> {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedVideo.commentsEnabled !== false && (
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      {commentMsg && (
                        <div className={`p-3 rounded-xl text-sm ${
                          commentMsg.includes('Thank you')
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>{commentMsg}</div>
                      )}
                      <div>
                        <label className="text-sm text-text-secondary block mb-1">Your Rating</label>
                        <StarInput rating={commentForm.rating} onChange={(r) => setCommentForm({ ...commentForm, rating: r })} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input value={commentForm.userName} onChange={(e) => setCommentForm({ ...commentForm, userName: e.target.value })}
                          placeholder="Your Name *" required className="input-field" />
                        <input value={commentForm.email} onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                          placeholder="Your Email (optional)" type="email" className="input-field" />
                      </div>
                      <textarea value={commentForm.comment} onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                        placeholder="Write your review... *" required rows={3} className="input-field resize-none" />
                      <button type="submit" disabled={submittingComment} className="btn-primary">
                        <FiSend /> {submittingComment ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </>
                )}
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
