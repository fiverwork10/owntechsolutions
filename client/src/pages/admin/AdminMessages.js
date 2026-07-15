import React, { useState } from 'react';
import { FiMessageCircle, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

export default function AdminMessages() {
  const { API } = useAuth();
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [showMobileList, setShowMobileList] = useState(false);

  const { data: conversations = [] } = useQuery({
    queryKey: ['admin', 'conversations'],
    queryFn: async () => {
      const res = await API.get('/messages/conversations');
      return res.data || [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin', 'messages', selected],
    queryFn: async () => {
      if (!selected) return [];
      const res = await API.get(`/messages?conversationId=${selected}`);
      await API.put('/messages/read', { conversationId: selected });
      return res.data.messages || [];
    },
    enabled: !!selected,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async () => {
      if (!reply.trim() || !selected) return;
      await API.post('/messages', { conversationId: selected, content: reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages', selected] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] });
      setReply('');
    },
  });

  const sendReply = () => {
    sendReplyMutation.mutate();
  };

  return (
    <AdminLayout title="Messages">
      <div className="flex gap-0 h-[calc(100vh-12rem)] relative">
        <button
          onClick={() => setShowMobileList(true)}
          className="md:hidden fixed bottom-6 right-6 z-20 w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <FiMessageCircle size={20} />
        </button>

        {(showMobileList || !selected) && (
          <div className={`${selected ? 'fixed inset-0 z-20 md:static md:z-auto' : ''} w-full md:w-72 md:shrink-0 border-r border-glass-border overflow-y-auto bg-background ${selected ? 'md:bg-transparent' : ''}`}>
            <div className="flex items-center justify-between p-3 border-b border-glass-border md:hidden">
              <span className="text-sm font-semibold">Conversations ({conversations.length})</span>
              {selected && (
                <button onClick={() => setShowMobileList(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                  <FiX size={16} />
                </button>
              )}
            </div>
            {conversations.map((conv) => (
              <button key={conv._id} onClick={() => { setSelected(conv._id); setShowMobileList(false); }} className={`w-full p-4 text-left border-b border-glass-border hover:bg-primary/5 transition-colors ${selected === conv._id ? 'bg-primary/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0"><FiUser size={16} className="text-white/70" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{conv.userId?.name || conv.visitorName || 'Guest'}</p>
                    <p className="text-xs text-white/50 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">{conv.unreadCount}</span>}
                </div>
              </button>
            ))}
            {conversations.length === 0 && <p className="text-white/50 text-sm p-4">No conversations yet</p>}
          </div>
        )}

        <div className={`flex-1 flex flex-col ${selected && !showMobileList ? 'block' : 'hidden md:flex'}`}>
          {selected ? (
            <>
              <div className="flex items-center gap-3 p-3 border-b border-glass-border md:hidden">
                <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline">Back</button>
                <span className="text-sm font-medium truncate">{conversations.find(c => c._id === selected)?.visitorName || 'Guest'}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl ${msg.sender === 'admin' ? 'bg-primary/20 border border-primary/30' : 'glass'}`}>
                      <p className="text-sm text-white">{msg.content}</p>
                      <p className="text-xs text-white/50 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-glass-border flex gap-3">
                <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendReply()} placeholder="Type reply..." className="input-field flex-1" />
                <button onClick={sendReply} className="btn-primary !py-2 shrink-0">Send</button>
              </div>
            </>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center text-white/50">
              <div className="text-center">
                <FiMessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
