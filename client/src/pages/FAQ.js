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
          <span className="text-primary text-sm font-medium tracking-widest uppercase">FAQ</span>
          <h1 className="section-title mt-4">Frequently Asked Questions</h1>
          <p className="section-subtitle">Everything you need to know about our services, process, and technology</p>
        </motion.div>

        <div className="relative mb-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..." className="input-field pl-12 py-4 text-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-neon'
                  : 'glass text-text-secondary hover:text-white hover:bg-primary/10'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><FiLoader className="animate-spin text-primary" size={32} /></div>
          ) : filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">No FAQs found matching your search</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-primary mt-2 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
          <AnimatePresence>
            {filteredFAQs.map((faq, i) => (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02 }}
                className="card !p-0 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-primary/5 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-xs text-primary font-medium mb-1 block">{categoryLabels[faq.category]}</span>
                    <h3 className="font-medium text-sm md:text-base">{faq.question}</h3>
                  </div>
                  <FiChevronDown
                    className={`shrink-0 text-primary transition-transform duration-300 ${
                      openItems[i] ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </button>
                <AnimatePresence>
                  {openItems[i] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-text-secondary text-sm leading-relaxed border-t border-glass-border pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
