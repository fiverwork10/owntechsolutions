import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiArrowRight, FiCode, FiSmartphone, FiLayout, FiServer, FiCloud, FiDatabase, FiGrid, FiMonitor, FiShield, FiX, FiMail, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

const iconMap = {
  FiCode, FiSmartphone, FiLayout, FiServer, FiCloud, FiDatabase, FiGrid, FiMonitor, FiShield
};

const fallbackServices = [
  {
    icon: 'FiCode', title: 'MERN Stack Development', price: 'PKR 40,000+', color: '#8B5CF6',
    features: ['Authentication', 'Admin Panel', 'REST APIs', 'Responsive Design', 'Database Design', 'Real-time Features'],
    technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Redux', 'Socket.io'],
    description: 'Full-stack web applications built with the modern MERN stack. From simple landing pages to complex enterprise platforms.'
  },
  {
    icon: 'FiSmartphone', title: 'Mobile App Development', price: 'PKR 35,000+', color: '#A78BFA',
    features: ['Cross-platform', 'Native Performance', 'Push Notifications', 'Offline Support', 'App Store Deployment', 'Analytics'],
    technologies: ['Flutter', 'Dart', 'Firebase', 'SQLite', 'REST APIs', 'Bloc/Cubit'],
    description: 'Beautiful, high-performance mobile applications for both iOS and Android using Flutter framework.'
  },
  {
    icon: 'FiLayout', title: 'UI/UX Design', price: 'PKR 10,000+', color: '#C084FC',
    features: ['Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Usability Testing', 'Interaction Design'],
    technologies: ['Figma', 'Canva', 'Adobe XD', 'Framer', 'After Effects', 'Miro'],
    description: 'User-centered design that creates intuitive, engaging experiences. We design interfaces that users love.'
  },
  {
    icon: 'FiServer', title: 'Enterprise Applications', price: 'PKR 70,000+', color: '#6D28D9',
    features: ['Scalable Architecture', 'Security', 'Integration', 'Reporting', 'Multi-tenancy', 'Audit Logging'],
    technologies: ['ASP.NET Core', 'SQL Server', 'Azure', 'AWS', 'Entity Framework', 'Microservices'],
    description: 'Robust enterprise-grade solutions built with Microsoft technologies. Secure, scalable, and reliable.'
  },
  {
    icon: 'FiCloud', title: 'API Development', price: 'PKR 25,000+', color: '#7C3AED',
    features: ['RESTful APIs', 'GraphQL', 'Authentication', 'Documentation', 'Rate Limiting', 'Testing'],
    technologies: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker'],
    description: 'Scalable and secure APIs that power your applications. We build robust backend services.'
  },
  {
    icon: 'FiDatabase', title: 'Cloud Deployment', price: 'PKR 20,000+', color: '#9333EA',
    features: ['CI/CD Pipelines', 'Auto-scaling', 'Monitoring', 'Backup & Recovery', 'Security', 'Optimization'],
    technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    description: 'Professional cloud infrastructure setup and deployment services. We ensure your applications run smoothly.'
  }
];

function ServiceModal({ service, onClose }) {
  if (!service) return null;
  const IconComp = iconMap[service.icon] || FiCode;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto card !p-0"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <FiX size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${service.color}20`, border: `1px solid ${service.color}30` }}>
              <IconComp size={32} style={{ color: service.color }} />
            </div>
            <span className="text-3xl font-bold gradient-text">{service.price}</span>
          </div>

          <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
          <p className="text-text-secondary leading-relaxed mb-6">{service.description}</p>

          <div className="mb-6">
            <p className="text-sm font-semibold text-primary mb-3">Features:</p>
            <div className="grid grid-cols-2 gap-2">
              {service.features.map((f, j) => (
                <div key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                  <FiCheck className="text-primary shrink-0" size={14} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-primary mb-3">Technologies:</p>
            <div className="flex flex-wrap gap-2">
              {service.technologies.map((tech, j) => (
                <span key={j} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: `${service.color}15`, color: service.color, border: `1px solid ${service.color}25` }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
            <Link
              to="/#contact"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary/20 border border-primary/30 text-white font-medium hover:bg-primary/30 transition-all"
            >
              <FiMail size={18} />
              Contact Us
            </Link>
            <a
              href="https://wa.me/923352546059"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 font-medium hover:bg-green-500/30 transition-all"
            >
              <FiPhone size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Services() {
  const [services, setServices] = useState(fallbackServices);
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = () => {
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/services`).then(res => {
      if (res.data.services?.length) setServices(res.data.services);
    }).catch(() => {});
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Our Services</span>
          <h1 className="section-title mt-4">Premium Development Services</h1>
          <p className="section-subtitle">
            From concept to deployment, we provide end-to-end development services tailored to your business needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {services.map((service, i) => {
            const IconComp = iconMap[service.icon] || FiCode;
            return (
            <div
              key={i}
              onClick={() => setSelectedService(service)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative card overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04] rounded-full blur-[100px]" style={{ background: service.color }} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${service.color}20`, border: `1px solid ${service.color}30` }}>
                    <IconComp size={28} style={{ color: service.color }} />
                  </div>
                  <span className="text-2xl font-bold gradient-text">{service.price}</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h2>
                <p className="text-text-secondary mb-6">{service.description}</p>
                <div className="mb-6">
                  <p className="text-sm font-semibold text-primary mb-3">Features:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {service.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                        <FiCheck className="text-primary shrink-0" size={14} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech, j) => (
                    <span key={j} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: `${service.color}15`, color: service.color, border: `1px solid ${service.color}25` }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );})}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 md:p-12 text-center max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-4">Custom Development</h3>
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            Custom websites and applications are priced according to project complexity, number of pages, features, integrations, deployment requirements, and timeline. Contact us for a personalized quote.
          </p>
          <Link to="/chat" className="btn-primary group text-lg">
            Get Custom Quote <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedService && (
          <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
