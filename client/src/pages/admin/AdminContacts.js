import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMail, FiPhone, FiCheck, FiClock, FiMessageCircle, FiChevronLeft, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { queryClient } from '../../components/QueryProvider';

export default function AdminContacts() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState(null);
  const [showList, setShowList] = useState(true);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: async () => {
      const res = await API.get('/contacts');
      return res.data.contacts || [];
    },
  });

  const readMutation = useMutation({
    mutationFn: async (contact) => {
      if (!contact.isRead) {
        await API.patch(`/contacts/${contact._id}/read`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      if (selectedContact?._id === id) setSelectedContact(null);
    },
  });

  const selectContact = (contact) => {
    setSelectedContact(contact);
    setShowList(false);
    if (!contact.isRead) {
      readMutation.mutate(contact);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this contact?')) return;
    deleteMutation.mutate(id);
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleString(); } catch { return ''; }
  };
  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }); } catch { return ''; }
  };

  return (
    <AdminLayout title={`Contacts (${contacts.length})`}>
      <div className="flex h-[calc(100dvh-12rem)] md:h-[calc(100vh-12rem)] -m-4 md:-m-8">
        <div className={`${showList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 shrink-0 border-r border-glass-border bg-background-card/30 overflow-hidden transition-all`}>
          <div className="p-3 md:p-4 border-b border-glass-border">
            <h2 className="font-bold text-sm md:text-base flex items-center gap-2"><FiMail className="text-primary" /> Contacts</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="p-8 text-center text-white/40 text-sm">Loading...</div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">No contacts yet</div>
            ) : (
              contacts.map((contact, i) => (
                <motion.div key={contact._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  onClick={() => selectContact(contact)}
                  className={`group rounded-xl p-3 cursor-pointer transition-all duration-200 border ${
                    selectedContact?._id === contact._id
                      ? 'bg-primary/15 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.12)]'
                      : contact.isRead ? 'bg-background-card/30 border-transparent hover:bg-primary/8 hover:border-primary/20' : 'bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-xs md:text-sm shrink-0 shadow-lg shadow-primary/20">
                      {contact.name?.[0]}
                      {!contact.isRead && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-[0_0_8px_rgba(139,92,246,0.6)]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${contact.isRead ? 'text-white/70' : 'font-semibold text-white'}`}>{contact.name}</p>
                        <p className="text-[10px] text-white/40 shrink-0">{formatDate(contact.createdAt)}</p>
                      </div>
                      <p className="text-xs text-white/50 truncate mt-0.5">{contact.subject || contact.message?.slice(0, 40)}</p>
                    </div>
                    {!contact.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className={`${!showList ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <FiMail size={48} className="mx-auto mb-4 opacity-30" />
                <p>Select a contact to view details</p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 p-3 md:p-4 border-b border-glass-border bg-background-card/50 flex items-center gap-3">
                <motion.button onClick={() => setShowList(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                  className="md:hidden w-8 h-8 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white shrink-0"
                >
                  <FiArrowLeft size={16} />
                </motion.button>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-xs md:text-sm shrink-0 shadow-lg shadow-primary/20">{selectedContact.name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{selectedContact.name}</p>
                  <p className={`text-[10px] flex items-center gap-1 ${selectedContact.isRead ? 'text-green-400' : 'text-primary'}`}>
                    <FiCheck size={10} /> {selectedContact.isRead ? 'Read' : 'Unread'}
                  </p>
                </div>
                <button onClick={() => handleDelete(selectedContact._id)} className="w-8 h-8 md:w-9 md:h-9 rounded-lg glass flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all shrink-0"><FiTrash2 size={14} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                <div className="glass rounded-2xl p-4 md:p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl gradient-bg flex items-center justify-center text-lg font-bold shrink-0">{selectedContact.name?.[0]}</div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedContact.name}</h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-white/60 mt-1">
                        <span className="flex items-center gap-1.5"><FiMail size={13} className="text-primary" /> {selectedContact.email}</span>
                        {selectedContact.phone && <span className="flex items-center gap-1.5"><FiPhone size={13} className="text-primary" /> {selectedContact.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1"><FiClock size={12} /> {formatTime(selectedContact.createdAt)}</span>
                    <span className={`flex items-center gap-1 ${selectedContact.isRead ? 'text-green-400' : 'text-primary'}`}>
                      <FiCheck size={12} /> {selectedContact.isRead ? 'Read' : 'Unread'}
                    </span>
                    {selectedContact.isReplied && <span className="text-green-400 flex items-center gap-1"><FiCheck size={12} /> Replied</span>}
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 md:p-5">
                  <p className="text-sm font-semibold text-primary mb-1">{selectedContact.subject}</p>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">{selectedContact.message}</p>
                </div>

                {!selectedContact.isReplied && (
                  <div className="flex justify-end">
                    <button onClick={() => navigate('/admin/chat')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
                    >
                      <FiMessageSquare size={15} /> Chat with {selectedContact.name?.split(' ')[0]}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
