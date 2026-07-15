import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPaperclip, FiSmile, FiUser, FiCpu, FiClock, FiX, FiFile, FiVideo, FiCheck, FiTrash2, FiMaximize2, FiDownload, FiMic } from 'react-icons/fi';
import { io } from 'socket.io-client';
import axios from 'axios';
import VoiceNotePlayer from '../components/VoiceNotePlayer';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = API;
const GUEST_KEY = 'owntech_chat_guest';

function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) { id = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); localStorage.setItem(GUEST_KEY, id); }
  return id;
}

const guestId = getGuestId();

export default function ChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    fetch(`${API}/api/chat/history?guestId=${guestId}${user?._id ? `&userId=${user._id}` : ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.conversation?._id) setConversationId(data.conversation._id);
        if (data.messages?.length) { setMessages(data.messages); }
        else {
          setMessages([{ _id: 'welcome', sender: 'bot', content: 'Hello! Welcome to OwnTechSolutions. How can we help you today?', createdAt: new Date() }]);
        }
      })
      .catch(() => setMessages([{ _id: 'welcome', sender: 'bot', content: 'Hello! Welcome to OwnTechSolutions. How can we help you today?', createdAt: new Date() }]));
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join_chat', guestId);
    if (user?._id) socket.emit('join_chat', user._id);

    socket.on('user:new_message', (msg) => {
      if (msg.conversationId) setConversationId(msg.conversationId);
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id || (m._id?.startsWith('temp') && msg.content === m.content && msg.sender === m.sender))) return prev;
        return [...prev, msg];
      });
    });

    socket.on('message:deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    socket.on('conversation:deleted', () => {
      setMessages([{ _id: 'welcome', sender: 'bot', content: 'Conversation cleared. How can we help you?', createdAt: new Date() }]);
    });

    socket.on('admin:typing', () => setAdminTyping(true));
    socket.on('admin:stop_typing', () => setAdminTyping(false));

    return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return;
    const text = input.trim();
    setInput('');
    setShowEmoji(false);
    setSending(true);

    if (selectedFile) {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('type', selectedFile.type.startsWith('image') ? 'image' : selectedFile.type.startsWith('video') ? 'video' : 'document');
      form.append('caption', text);
      form.append('guestId', guestId);
      if (user?._id) form.append('userId', user._id);
      try {
        await axios.post(`${API}/api/whatsapp/send-media`, form);
      } catch {}
      setSelectedFile(null);
      setFilePreview(null);
      setSending(false);
      return;
    }

    const socket = socketRef.current;
    if (socket) {
      socket.emit('user:send', { guestId, content: text, messageType: 'text', visitorName: user?.name || 'Website Visitor', userId: user?._id });
    }
    setSending(false);
  };

  const deleteMessage = (msgId) => {
    if (msgId === 'welcome') return;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('message:delete', { messageId: msgId, guestId, conversationId });
  };

  const deleteConversation = () => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('conversation:delete', { guestId, conversationId });
    setMessages([{ _id: 'welcome', sender: 'bot', content: 'Conversation cleared. How can we help you?', createdAt: new Date() }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) setFilePreview({ type: 'image', url: URL.createObjectURL(file) });
    else if (file.type.startsWith('video/')) setFilePreview({ type: 'video', url: URL.createObjectURL(file) });
    else setFilePreview({ type: 'document', name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    setShowEmoji(false);
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
        form.append('guestId', guestId);
        if (user?._id) form.append('userId', user._id);
        try {
          await axios.post(`${API}/api/whatsapp/send-media`, form);
        } catch {}
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

  useEffect(() => {
    messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  let recordingLock = false;
  const handleMicClick = () => {
    if (recordingLock) return;
    if (isRecording) { recordingLock = true; stopRecording(); setTimeout(() => { recordingLock = false; }, 500); return; }
    startRecording();
  };

  const emitTyping = () => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('user:typing', { guestId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit('user:stop_typing', { guestId }), 1500);
  };

  const emojis = ['😀', '😊', '👍', '🎉', '🚀', '💻', '📱', '✨', '💡', '⭐', '❤️', '🔥', '✅', '🎯', '💪', '🤝', '📞', '✉️', '📎', '🖼️', '🎬', '📄'];
  const formatTime = (d) => { try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  if (!user) {
    return (
      <div className="pt-20 md:pt-24 pb-6 md:pb-10 flex flex-col chat-bg items-center justify-center">
        <div className="glass rounded-2xl p-8 md:p-12 max-w-md mx-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto">
            <FiCpu size={32} />
          </div>
          <h2 className="text-2xl font-bold">Welcome to Support</h2>
          <p className="text-white">Please login or create an account to start chatting with our support team.</p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="w-full py-3 rounded-xl gradient-bg font-semibold text-center transition-all hover:shadow-[0_0_12px_rgba(139,92,246,0.25)] active:scale-[0.98]">Login</Link>
            <Link to="/signup" className="w-full py-3 rounded-xl glass font-semibold text-center border border-glass-border transition-all hover:shadow-[0_0_12px_rgba(139,92,246,0.25)] active:scale-[0.98]">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-6 md:pb-10 flex flex-col chat-bg">
      <div className="rain-layer">
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
      </div>
      <div className="chat-fog" />
      <div className="chat-fog-2" />
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
              {lightbox.type === 'image' ? <img src={lightbox.url} alt="" className="max-w-full max-h-dvh object-contain rounded-xl md:rounded-2xl shadow-2xl shadow-primary/10" onClick={e => e.stopPropagation()} />
              : <video src={lightbox.url} controls className="max-w-full max-h-dvh rounded-xl md:rounded-2xl shadow-2xl shadow-primary/10" onClick={e => e.stopPropagation()} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col max-w-full mx-auto w-full relative z-[3]">
        <div className="px-3 md:px-8 py-3 md:py-4 border-b border-glass-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl gradient-bg flex items-center justify-center font-bold text-base md:text-lg shrink-0">O</div>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-semibold truncate">OwnTechSolutions Support</p>
              <p className="text-xs text-white flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Online</p>
            </div>
          </div>
          {messages.length > 1 && (
            <button onClick={deleteConversation} className="text-xs text-white hover:text-white/70 transition-colors flex items-center gap-1 py-1 px-2 -mr-2 rounded-lg active:bg-white/10"><FiTrash2 size={12} />Clear chat</button>
          )}
        </div>

        <div ref={messagesContainerRef} className="overflow-y-auto px-3 md:px-8 py-3 md:py-6 space-y-3 md:space-y-4 max-h-[55vh] md:max-h-[60vh] min-h-[300px] md:min-h-[400px]">
            {messages.map((msg) => (
              <motion.div key={msg._id}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 200, damping: 22 }}
                className={`group flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 md:gap-3 max-w-[92%] md:max-w-[70%] min-w-0 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 md:w-9 md:h-9 rounded-xl shrink-0 flex items-center justify-center ${
                    msg.sender === 'user' ? 'gradient-bg' :
                    msg.sender === 'admin' ? 'bg-blue-500/20 border border-blue-500/30' : 'glass'
                  }`}>
                    {msg.sender === 'user' ? <FiUser size={15} /> :
                     msg.sender === 'admin' ? <FiCpu size={15} className="text-white/70" /> :
                     <FiCpu size={15} className="text-white/70" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl p-3 md:p-4 overflow-hidden ${msg.sender === 'user' ? 'bg-primary/20 border border-primary/30' : msg.sender === 'admin' ? 'glass border-blue-500/20' : 'glass'}`}>
                      {msg.fileUrl && msg.messageType === 'image' && (
                        <div className="relative mb-2">
                          <img src={msg.fileUrl} alt="" className="w-full rounded-lg max-h-48 md:max-h-64 object-cover cursor-pointer" onClick={() => setLightbox({ type: 'image', url: msg.fileUrl })} />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={async (e) => { e.stopPropagation(); try { const r = await fetch(msg.fileUrl); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = msg.fileName || msg.fileUrl.split('/').pop() || 'download'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch {} }} className="w-8 h-8 md:w-9 md:h-9 rounded-lg glass flex items-center justify-center active:scale-90"><FiDownload size={14} /></button>
                            <button onClick={() => setLightbox({ type: 'image', url: msg.fileUrl })} className="w-8 h-8 md:w-9 md:h-9 rounded-lg glass flex items-center justify-center active:scale-90"><FiMaximize2 size={14} /></button>
                          </div>
                        </div>
                      )}
                      {msg.fileUrl && msg.messageType === 'video' && (
                        <video src={msg.fileUrl} controls className="w-full rounded-lg max-h-48 md:max-h-64 mb-2" />
                      )}
                      {msg.fileUrl && msg.messageType === 'document' && (
                        <div className="flex items-center gap-2 p-2 rounded-lg glass mb-2">
                          <FiFile size={16} className="text-white" />
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-white hover:underline truncate">{msg.fileName || 'Download'}</a>
                        </div>
                      )}
                      {msg.fileUrl && msg.messageType === 'voice' && (
                        <div className="mb-1">
                          <VoiceNotePlayer fileUrl={msg.fileUrl} fileName={msg.fileName || 'voice-note.webm'} msgId={msg._id} myMessage={msg.sender === 'user'} />
                        </div>
                      )}
                      {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <p className="text-[10px] md:text-[11px] text-white/60 flex items-center gap-1"><FiClock size={9} />{formatTime(msg.createdAt)}</p>
                      {msg.sender === 'user' && <FiCheck size={10} className="text-white" />}
                      {msg._id !== 'welcome' && (
                        <button onClick={() => deleteMessage(msg._id)} className="text-[10px] md:text-[11px] text-white/60 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all active:text-white"><FiTrash2 size={11} /></button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          {adminTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl glass flex items-center justify-center"><FiCpu size={13} className="text-primary" /></div>
              <div className="flex items-center gap-1 px-3 py-2 rounded-xl glass">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-3 md:px-8 py-2 md:py-4 border-t border-glass-border bg-background">
          <AnimatePresence>
            {filePreview && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-2 md:mb-3 p-2 md:p-3 rounded-xl glass flex items-center gap-2 md:gap-3 relative shadow-lg shadow-primary/10 border border-primary/10"
              >
                <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full glass flex items-center justify-center hover:text-white z-10"><FiX size={12} /></button>
              {filePreview.type === 'image' && <img src={filePreview.url} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shrink-0" />}
              {filePreview.type === 'video' && <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg glass flex items-center justify-center shrink-0"><FiVideo size={20} className="text-white" /></div>}
              {filePreview.type === 'document' && <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg glass flex items-center justify-center shrink-0"><FiFile size={20} className="text-white" /></div>}
              <div className="min-w-0"><p className="text-sm font-medium truncate text-white">{filePreview.name || 'File selected'}</p><p className="text-xs text-white/60">{filePreview.size || ''}</p></div>
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

          <div className="flex items-center gap-2 md:gap-3">
            <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" onChange={handleFileSelect} className="hidden" />
            <motion.button onClick={() => setShowEmoji(!showEmoji)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/30 hover:border-primary/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.25)] transition-all shrink-0"
            >
              <FiSmile size={17} />
            </motion.button>
            <motion.button onClick={() => fileInputRef.current?.click()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/30 hover:border-primary/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.25)] transition-all shrink-0"
            >
              <FiPaperclip size={17} />
            </motion.button>
            <motion.button onClick={handleMicClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isRecording
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/25 text-primary hover:bg-primary/30 hover:border-primary/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]'
              }`}
            >
              <FiMic size={17} />
            </motion.button>
            <div className="flex-1 relative">
              <textarea value={input} onChange={e => { setInput(e.target.value); emitTyping(); }} onKeyPress={handleKeyPress} placeholder="Type a message..." className="w-full px-4 md:px-5 py-2.5 md:py-3.5 bg-background border border-primary/30 rounded-xl text-white placeholder-white/50 outline-none resize-none text-sm leading-relaxed shadow-[0_0_20px_rgba(139,92,246,0.15)] focus:shadow-[0_0_30px_rgba(139,92,246,0.3)] focus:border-primary/50 transition-all duration-300" rows={1} disabled={sending}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
            </div>
            <motion.button onClick={sendMessage} disabled={!input.trim() && !selectedFile || sending} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl gradient-bg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] shrink-0">
              {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSend size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
}
