import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiLoader } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const categories = ['all', 'mern', 'mobile', 'flutter', 'react', 'nodejs', 'mongodb', 'aspnet', 'ui-ux', 'pricing', 'hosting', 'deployment', 'maintenance', 'security', 'seo', 'timelines', 'general'];

const categoryLabels = {
  all: 'All', mern: 'MERN Stack', mobile: 'Mobile Apps', flutter: 'Flutter',
  react: 'React.js', nodejs: 'Node.js', mongodb: 'MongoDB', aspnet: 'ASP.NET',
  'ui-ux': 'UI/UX Design', pricing: 'Pricing', hosting: 'Hosting',
  deployment: 'Deployment', maintenance: 'Maintenance', security: 'Security',
  seo: 'SEO', timelines: 'Timelines', general: 'General'
};

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/faqs`);
      return res.json();
    },
  });

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchSearch = !search ||
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [faqs, activeCategory, search]);

  const toggleItem = (index) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#C084FC' }}>FAQ</motion.span>
          <h1 className="section-title mt-4 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-16 rounded-full" style={{ background: 'rgba(139,92,246,0.35)', filter: 'blur(50px)' }} />
            </div>
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl md:text-7xl lg:text-8xl font-extrabold pointer-events-none select-none" style={{ color: 'rgba(139,92,246,0.5)', filter: 'blur(12px)', animation: 'glowPulse 3s ease-in-out infinite' }}>
              Frequently Asked Questions
            </span>
            <span className="bg-clip-text text-transparent text-6xl md:text-7xl lg:text-8xl font-extrabold" style={{ backgroundImage: 'linear-gradient(90deg, #C084FC, #A78BFA, #67E8F9, #C084FC)', backgroundSize: '300% 100%', animation: 'gradient 6s ease infinite' }}>
              Frequently Asked Questions
            </span>
          </h1>
          <p className="section-subtitle">Everything you need to know about our services, process, and technology</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative mb-8" style={{ border: '1px solid rgba(139,92,246,0.25)', borderRadius: '0.75rem', boxShadow: '0 0 20px rgba(139,92,246,0.1)' }}>
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..." className="input-field pl-12 py-4 text-lg"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06), transparent)', border: 'none', boxShadow: 'none' }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'text-white'
                  : 'glass text-text-secondary hover:text-white'
              }`}
              style={activeCategory === cat ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.45), rgba(139,92,246,0.25))', border: '1px solid rgba(139,92,246,0.55)', boxShadow: '0 0 25px rgba(139,92,246,0.25)' } : {}}
            >
              {categoryLabels[cat]}
            </motion.button>
          ))}
        </motion.div>

        <div className="flex flex-col gap-8 my-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><FiLoader className="animate-spin text-purple-400" size={32} /></div>
          ) : filteredFAQs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="text-white/60 text-lg">No FAQs found matching your search</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-purple-400 mt-2 hover:underline">
                Clear filters
              </button>
            </motion.div>
          ) : (
          <AnimatePresence>
            {filteredFAQs.map((faq, i) => (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="overflow-hidden relative group rounded-2xl"
                style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.06), transparent)`, border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 0 20px rgba(139,92,246,0.06)' }}
              >
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-purple-500/15 via-transparent to-purple-500/8 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                <button
                  onClick={() => toggleItem(i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors"
                  style={{ background: openItems[i] ? 'rgba(139,92,246,0.06)' : 'transparent' }}
                >
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] tracking-wider text-purple-400 font-semibold uppercase mb-1 block">{categoryLabels[faq.category]}</span>
                    <h3 className="font-semibold text-base md:text-lg text-white group-hover:text-purple-300 transition-colors">{faq.question}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: openItems[i] ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#C084FC' }}
                  >
                    <FiChevronDown size={18} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openItems[i] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="px-5 md:px-6 pb-5 md:pb-6 text-white/70 text-sm leading-relaxed border-t border-purple-500/15 pt-4"
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
