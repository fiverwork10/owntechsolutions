import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { FiSend, FiPaperclip, FiTrash2, FiX, FiDownload, FiMaximize2, FiMessageCircle, FiUser, FiCpu, FiClock, FiCheck, FiChevronLeft, FiImage, FiVideo, FiFile, FiMic, FiSearch, FiSmile } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import VoiceNotePlayer from '../../components/VoiceNotePlayer';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_BASE;

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [search, setSearch] = useState('');
  const [userTyping, setUserTyping] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sendingMedia, setSendingMedia] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const uploadMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  const cancelRef = useRef(false);
  const thumbRef = useRef(null);

  const { data: fetchedConversations = [] } = useQuery({
    queryKey: ['admin', 'chat-conversations', search],
    queryFn: async () => {
      const url = search ? `/api/chat/conversations?search=${encodeURIComponent(search)}` : `/api/chat/conversations`;
      const res = await fetch(`${API_BASE}${url}`);
      return res.json();
    },
    staleTime: search ? 5000 : 30000,
  });

  useEffect(() => {
    setConversations(fetchedConversations);
  }, [fetchedConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join_admin');

    socket.on('admin_message', (data) => {
      const convId = data.conversation?._id || data.conversationId;
      setConversations(prev => {
        const exists = prev.find(c => c._id === convId);
        if (!exists && data.conversation) return [data.conversation, ...prev];
        return prev.map(c => c._id === convId ? { ...c, lastMessage: data.content || 'Media', lastMessageAt: new Date(), unreadCount: (c.unreadCount || 0) + (selectedConv?._id !== convId ? 1 : 0) } : c);
      });
      if (selectedConv && convId === selectedConv._id) {
        setMessages(prev => prev.filter(m => !m._id?.startsWith('temp_')).concat(data));
      }
    });

    socket.on('message:deleted', ({ messageId, conversationId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    socket.on('conversation:deleted', ({ conversationId }) => {
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (selectedConv?._id === conversationId) { setSelectedConv(null); setMessages([]); }
    });

    socket.on('user:typing', () => setUserTyping(true));
    socket.on('user:stop_typing', () => setUserTyping(false));

    return () => { socket.emit('leave_admin'); socket.disconnect(); };
  }, [selectedConv]);

  const { data: convMessages = [] } = useQuery({
    queryKey: ['admin', 'chat-messages', selectedConv?._id],
    queryFn: async () => {
      if (!selectedConv) return [];
      const res = await fetch(`${API_BASE}/api/chat/conversation/${selectedConv._id}`);
      return res.json();
    },
    enabled: !!selectedConv,
  });

  useEffect(() => {
    setMessages(convMessages);
  }, [convMessages]);

  const selectConversation = (conv) => {
    setSelectedConv(conv);
    if (window.innerWidth < 768) setShowSidebar(false);
    setTimeout(scrollToBottom, 100);
  };

  const sendReply = async () => {
    if (!input.trim() && !selectedFile) return;
    const text = input.trim();
    setInput('');

    const socket = socketRef.current;
    if (!socket || !selectedConv) return;

    if (selectedFile) {
      setSendingMedia(true);
      const form = new FormData();
      form.append('file', selectedFile);
      const fileType = selectedFile.type.startsWith('image') ? 'image' : selectedFile.type.startsWith('video') ? 'video' : 'document';
      form.append('type', fileType);
      form.append('caption', text);
      form.append('guestId', selectedConv.guestId);
      form.append('conversationId', selectedConv._id);
      form.append('sender', 'admin');
      const thumbUrl = thumbRef.current?.thumbUrl;
      setMessages(prev => [...prev, {
        _id: `temp_${Date.now()}`,
        sender: 'admin',
        content: text || '',
        createdAt: new Date().toISOString(),
        fileUrl: fileType === 'image' || fileType === 'video' ? (thumbUrl || URL.createObjectURL(selectedFile)) : undefined,
        fileName: selectedFile.name,
        messageType: fileType,
        sending: true
      }]);
      try {
        await fetch(`${API_BASE}/api/whatsapp/send-media`, { method: 'POST', body: form });
      } catch {}
      setSelectedFile(null);
      setFilePreview(null);
      thumbRef.current = null;
      setSendingMedia(false);
      return;
    }

    setMessages(prev => [...prev, {
      _id: `temp_${Date.now()}`,
      sender: 'admin',
      content: text,
      createdAt: new Date().toISOString(),
      messageType: 'text',
      sending: true
    }]);
    socket.emit('admin:reply', {
      conversationId: selectedConv._id,
      guestId: selectedConv.guestId,
      content: text,
      messageType: 'text'
    });
  };

  const deleteMessage = (msgId) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('message:delete', { messageId: msgId, conversationId: selectedConv._id, guestId: selectedConv.guestId });
  };

  const deleteConversation = () => {
    if (!window.confirm('Delete entire conversation?')) return;
    const socket = socketRef.current;
    if (!socket || !selectedConv) return;
    socket.emit('conversation:delete', { conversationId: selectedConv._id, guestId: selectedConv.guestId });
    setSelectedConv(null);
    setMessages([]);
  };

  const deleteConversationItem = (e, conv) => {
    e.stopPropagation();
    if (!window.confirm(`Delete conversation with ${conv.userId?.name || conv.visitorName || 'Guest'}?`)) return;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('conversation:delete', { conversationId: conv._id, guestId: conv.guestId });
    if (selectedConv?._id === conv._id) { setSelectedConv(null); setMessages([]); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const createThumbnail = (file, maxSize = 200) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadMenu(false);
    setShowEmoji(false);
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const thumb = await createThumbnail(file);
      const thumbUrl = URL.createObjectURL(thumb);
      thumbRef.current = { file, thumbUrl };
      setFilePreview({ type: 'image', url: thumbUrl });
    } else if (file.type.startsWith('video/')) {
      thumbRef.current = { file, thumbUrl: URL.createObjectURL(file) };
      setFilePreview({ type: 'video', url: thumbRef.current.thumbUrl });
    } else setFilePreview({ type: 'document', name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
  };

  const triggerFilePick = (accept) => {
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        if (cancelRef.current || chunks.length === 0) {
          cancelRef.current = false;
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          setIsRecording(false);
          setRecordingDuration(0);
          return;
        }
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: mediaRecorder.mimeType });
        const form = new FormData();
        form.append('file', file);
        form.append('type', 'voice');
        form.append('caption', '');
        form.append('guestId', selectedConv?.guestId || '');
        form.append('conversationId', selectedConv?._id || '');
        form.append('sender', 'admin');
        setSendingMedia(true);
        setMessages(prev => [...prev, {
          _id: `temp_voice_${Date.now()}`,
          sender: 'admin',
          content: '🎤 Voice note',
          createdAt: new Date().toISOString(),
          messageType: 'voice',
          sending: true
        }]);
        try {
          await fetch(`${API_BASE}/api/whatsapp/send-media`, { method: 'POST', body: form });
        } catch {}
        setSendingMedia(false);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        setRecordingDuration(0);
      };
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      let sec = 0;
      recordingTimerRef.current = setInterval(() => { sec++; setRecordingDuration(sec); if (sec >= 60) stopRecording(); }, 1000);
    } catch {}
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
    cancelRef.current = true;
    stopRecording();
  };

  let recordingLock = false;
  const handleMicClick = () => {
    if (recordingLock) return;
    setShowEmoji(false);
    if (isRecording) { recordingLock = true; stopRecording(); setTimeout(() => { recordingLock = false; }, 500); return; }
    startRecording();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target)) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const emitTyping = () => {
    const socket = socketRef.current;
    if (!socket || !selectedConv) return;
    socket.emit('admin:typing', { guestId: selectedConv.guestId, conversationId: selectedConv._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit('admin:stop_typing', { guestId: selectedConv.guestId, conversationId: selectedConv._id }), 1500);
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };
  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }); } catch { return ''; }
  };
  const emojis = ['😀', '😊', '👍', '🎉', '🚀', '💻', '📱', '✨', '💡', '⭐', '❤️', '🔥', '✅', '🎯', '💪', '🤝', '📞', '✉️', '📎', '🖼️', '🎬', '📄'];

  return (
    <AdminLayout title="Live Chat">
      <div className="flex h-[calc(100dvh-8rem)] md:h-[calc(100dvh-8rem)] -m-4 md:-m-8 chat-bg">
        {!isMobile && (<div className="rain-layer">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`drop-${i}`}>
              <div className="rain-drop" style={{
                left: `${(i * 8 + 2) % 100}%`,
                height: `${15 + (i % 3) * 10}px`,
                '--duration': `${1.8 + (i % 4) * 0.3}s`,
                '--delay': `${(i * 0.2) % 2}s`
              }} />
              <div className="rain-splash" style={{
                left: `${(i * 8 + 2) % 100}%`,
                '--delay': `${(i * 0.2) % 2}s`
              }} />
              <div className="rain-splash" style={{
                left: `${(i * 8 + 2) % 100}%`,
                '--delay': `${(i * 0.2) % 2}s`
              }} />
              <div className="rain-splash" style={{
                left: `${(i * 8 + 2) % 100}%`,
                '--delay': `${(i * 0.2) % 2}s`
              }} />
            </div>
          ))}
        </div>)}
        {!isMobile && <div className="chat-fog" />}
        {!isMobile && <div className="chat-fog-2" />}
        <AnimatePresence>
          {lightbox && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button onClick={async (e) => { e.stopPropagation(); try { const r = await fetch(lightbox.url); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = lightbox.url.split('/').pop() || 'download'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch {} }} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-white/80 active:scale-90 shadow-lg shadow-primary/20"><FiDownload size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-white/80 active:scale-90 shadow-lg shadow-primary/20"><FiX size={20} /></button>
              </div>
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex items-center justify-center p-2 md:p-4 max-w-full max-h-full"
              >
                {lightbox.type === 'image' ? (
                  <img src={lightbox.url} alt="" className="max-w-full max-h-dvh object-contain rounded-xl md:rounded-2xl shadow-2xl shadow-primary/10" onClick={e => e.stopPropagation()} />
                ) : lightbox.type === 'video' ? (
                  <video src={lightbox.url} controls className="max-w-full max-h-dvh rounded-xl md:rounded-2xl shadow-2xl shadow-primary/10" onClick={e => e.stopPropagation()} />
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex md:flex flex-col shrink-0 border-r bg-background-card/30 overflow-hidden transition-all duration-300 ease-in-out relative z-10 ${
          showSidebar ? 'max-w-full md:max-w-[320px] lg:max-w-[384px] border-glass-border' : 'max-w-0 border-transparent'
        }`}>
          <div className="p-3 md:p-4 border-b border-glass-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm md:text-base flex items-center gap-2"><FiMessageCircle className="text-primary" /> Conversations</h2>
              <motion.button onClick={() => setShowSidebar(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white hover:bg-primary/20 transition-all border border-glass-border hover:border-primary/30"
                title="Close sidebar"
              >
                <FiChevronLeft size={14} />
              </motion.button>
            </div>
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search registered users..." className="input-field !py-2 !pl-9 !text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-text-muted text-sm">No conversations yet</motion.div>
            ) : (
              <AnimatePresence>
                {conversations.map((conv, i) => (
                  <motion.div key={conv._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 28 }}
                    onClick={() => selectConversation(conv)}
                    className={`group rounded-xl p-2 md:p-3 cursor-pointer transition-all duration-200 border ${
                      selectedConv?._id === conv._id
                        ? 'bg-primary/15 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.12)]'
                        : 'bg-background-card/50 border-transparent hover:bg-primary/8 hover:border-primary/20 hover:shadow-[0_0_10px_rgba(139,92,246,0.06)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-xs md:text-sm shrink-0 shadow-lg shadow-primary/20">{(conv.userId?.name || conv.visitorName || 'G')[0]}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{conv.userId?.name || conv.visitorName || 'Guest'}</p>
                          <p className="text-[10px] text-text-muted shrink-0">{formatDate(conv.lastMessageAt)}</p>
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5">{conv.lastMessage || 'No messages'}</p>
                      </div>
                      <button onClick={(e) => deleteConversationItem(e, conv)}
                        className="shrink-0 w-7 h-7 rounded-lg glass opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                        title="Delete conversation"
                      >
                        <FiTrash2 size={11} />
                      </button>
                      {(conv.unreadCount || 0) > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.4)]">{conv.unreadCount}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
        <div className={`${showSidebar ? 'hidden' : 'flex'} md:flex flex-1 flex-col relative z-[3]`}>
          {!selectedConv ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <FiMessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                <p>Select a conversation to start chatting</p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="shrink-0 p-3 md:p-4 border-b border-glass-border bg-background-card/50 flex items-center gap-2 md:gap-3">
                <motion.button onClick={() => setShowSidebar(!showSidebar)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl glass flex items-center justify-center text-white hover:bg-primary/20 transition-all shrink-0 border border-glass-border hover:border-primary/30"
                  title={showSidebar ? 'Close sidebar' : 'Open sidebar'}
                >
                  <motion.div animate={{ rotate: showSidebar ? 0 : 180 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }}>
                    <FiChevronLeft size={16} />
                  </motion.div>
                </motion.button>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-xs md:text-sm shadow-lg shadow-primary/20 shrink-0">{selectedConv.userId?.name?.[0] || selectedConv.visitorName?.[0] || 'G'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs md:text-sm truncate">{selectedConv.userId?.name || selectedConv.visitorName || 'Guest'}</p>
                  <p className="text-[10px] text-text-muted truncate">{selectedConv.guestId?.slice(0, 30)}</p>
                </div>
                <button onClick={deleteConversation} className="w-8 h-8 md:w-9 md:h-9 rounded-lg glass flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all shrink-0" title="Delete conversation"><FiTrash2 size={13} /></button>
              </div>

              <div data-lenis-prevent className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 overscroll-contain">
                <AnimatePresence>
                  {messages.map(msg => (
                    <motion.div key={msg._id} initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25, type: 'spring', stiffness: 200, damping: 22 }}
                      className={`group flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                    <div className="max-w-[90%] md:max-w-[70%]">
                      <div className={`rounded-2xl p-3 ${msg.sender === 'admin' ? 'bg-blue-500/20 border border-blue-500/30' : 'glass'}`}>
                        {msg.fileUrl && msg.messageType === 'image' && (
                          <div className="relative mb-2">
                            <img src={msg.fileUrl} alt="" className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer" onClick={() => setLightbox({ type: 'image', url: msg.fileUrl })} />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={async (e) => { e.stopPropagation(); try { const r = await fetch(msg.fileUrl); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = msg.fileName || msg.fileUrl.split('/').pop() || 'download'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch {} }} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white"><FiDownload size={14} /></button>
                              <button onClick={() => setLightbox({ type: 'image', url: msg.fileUrl })} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white"><FiMaximize2 size={14} /></button>
                            </div>
                          </div>
                        )}
                        {msg.fileUrl && msg.messageType === 'video' && (
                          <div className="relative mb-2">
                            <video src={msg.fileUrl} controls className="max-w-full rounded-lg max-h-64" />
                          </div>
                        )}
                        {msg.fileUrl && msg.messageType === 'document' && (
                          <div className="flex items-center gap-2 p-2 rounded-lg glass mb-2">
                            <FiPaperclip size={16} className="text-primary" />
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">{msg.fileName || 'Download'}</a>
                          </div>
                        )}
                        {msg.fileUrl && msg.messageType === 'voice' && (
                          <div className="mb-1">
                            <VoiceNotePlayer fileUrl={msg.fileUrl} fileName={msg.fileName || 'voice-note.webm'} msgId={msg._id} onDelete={deleteMessage} myMessage={msg.sender === 'admin'} />
                          </div>
                        )}
                        {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-text-muted">{formatTime(msg.createdAt)}</p>
                        {msg.sender === 'admin' && <FiCheck size={10} className="text-green-400" />}
                        <button onClick={() => deleteMessage(msg._id)} className="text-[10px] text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><FiTrash2 size={12} /></button>
                      </div>
                    </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <AnimatePresence>
                  {userTyping && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl glass flex items-center justify-center"><FiUser size={13} className="text-primary" /></div>
                      <div className="flex items-center gap-1 px-3 py-2 rounded-xl glass">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 p-3 md:p-4 border-t border-glass-border bg-background-card/30">
                <AnimatePresence>
                  {filePreview && (
                    <motion.div initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="mb-2 md:mb-3 p-2 md:p-3 rounded-xl glass flex items-center gap-2 md:gap-3 relative border border-primary/10 shadow-lg shadow-primary/10"
                    >
                    <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full glass flex items-center justify-center hover:text-red-400"><FiX size={12} /></button>
                    {filePreview.type === 'image' && <img src={filePreview.url} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover shrink-0" />}
                    {filePreview.type === 'video' && <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg glass flex items-center justify-center shrink-0"><FiCpu size={16} className="text-primary" /></div>}
                    {filePreview.type === 'document' && <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg glass flex items-center justify-center shrink-0"><FiPaperclip size={16} className="text-primary" /></div>}
                    <span className="text-xs md:text-sm truncate">{filePreview.name || 'File'}</span>
                    </motion.div>
                  )}
                  </AnimatePresence>
                <AnimatePresence>
                  {isRecording && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="mb-2 md:mb-3 p-3 md:p-4 rounded-xl glass flex items-center gap-3 border border-red-500/30 shadow-lg shadow-red-500/10"
                    >
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <div className="flex items-center gap-1.5 flex-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <motion.div key={i} animate={{ height: [4, Math.random() * 24 + 4, 4] }} transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                            className="w-1 rounded-full bg-red-400/70" style={{ height: 4 }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-mono text-white/80 shrink-0">{String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:{String(recordingDuration % 60).padStart(2, '0')}</span>
                      <motion.button onClick={cancelRecording} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all shrink-0"
                      >
                        <FiX size={14} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3 p-2 md:p-3 rounded-xl glass max-h-24 md:max-h-32 overflow-y-auto shadow-lg shadow-primary/10 border border-primary/10"
                    >
                      {emojis.map((emoji, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setInput(prev => prev + emoji)} className="text-lg md:text-xl w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg active:bg-white/10">{emoji}</motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="max-w-3xl mx-auto w-full relative">
                  <div className="absolute -inset-6 bg-primary/30 rounded-[2rem] blur-3xl opacity-80 pointer-events-none" />
                  <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-primary/40 rounded-2xl md:rounded-full px-2 md:px-4 py-2.5 md:py-3.5 shadow-[0_0_24px_rgba(139,92,246,0.15)] focus-within:border-primary/60 focus-within:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-300">
                    <div className="flex items-center gap-0.5">
                      <div className="relative" ref={uploadMenuRef}>
                        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
                        <motion.button onClick={() => { setShowUploadMenu(!showUploadMenu); setShowEmoji(false); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-full bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:bg-purple-500/40 hover:border-purple-500/50 hover:shadow-[0_0_14px_rgba(168,85,247,0.3)] transition-all shrink-0"
                        >
                          <FiPaperclip size={15} />
                        </motion.button>
                        <AnimatePresence>
                          {showUploadMenu && (
                            <motion.div initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 10 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                              className="absolute bottom-full left-0 mb-2 p-1.5 rounded-2xl bg-[#0f0f1a] border border-primary/25 shadow-xl shadow-black/50 min-w-[190px]"
                            >
                              <button onClick={() => triggerFilePick('image/*')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-all group">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/25 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-shadow"><FiImage size={16} className="text-purple-400" /></div>
                                <div className="text-left"><p className="text-sm font-semibold text-white">Image</p><p className="text-[10px] text-white/40">Upload photos</p></div>
                              </button>
                              <button onClick={() => triggerFilePick('video/*')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-all group">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-blue-500/25 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-shadow"><FiVideo size={16} className="text-blue-400" /></div>
                                <div className="text-left"><p className="text-sm font-semibold text-white">Video</p><p className="text-[10px] text-white/40">Upload videos</p></div>
                              </button>
                              <button onClick={() => triggerFilePick('.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-all group">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/25 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-shadow"><FiFile size={16} className="text-amber-400" /></div>
                                <div className="text-left"><p className="text-sm font-semibold text-white">Document</p><p className="text-[10px] text-white/40">Upload files</p></div>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.button onClick={() => { setShowEmoji(!showEmoji); setShowUploadMenu(false); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/40 hover:border-yellow-500/50 hover:shadow-[0_0_14px_rgba(234,179,8,0.3)] transition-all shrink-0"
                      >
                        <FiSmile size={15} />
                      </motion.button>
                    </div>
                    <textarea value={input} onChange={e => { setInput(e.target.value); emitTyping(); }} onKeyPress={handleKeyPress} placeholder="Type a reply..." className="flex-1 px-1 py-2.5 md:py-3 bg-transparent text-white placeholder-white/30 outline-none resize-none text-sm md:text-base leading-relaxed min-w-0 max-h-32" rows={1} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'; }} />
                    <div className="flex items-center gap-1">
                      <motion.button onClick={handleMicClick} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isRecording ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'bg-gradient-to-br from-rose-500/30 to-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/40 hover:border-rose-500/50 hover:shadow-[0_0_14px_rgba(244,63,94,0.3)]'
                        }`}
                      >
                        <FiMic size={15} />
                      </motion.button>
                      <motion.button onClick={sendReply} disabled={(!input.trim() && !selectedFile) || sendingMedia} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-full gradient-bg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-primary/25 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]">{sendingMedia ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FiSend size={15} />}</motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
