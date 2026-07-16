import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiPhone, FiMapPin, FiMessageCircle, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { gsap } from 'gsap';

const quickLinks = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'Services' },
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/faq', label: 'FAQs' },
];

const services = [
  { path: '/services', label: 'MERN Stack' },
  { path: '/services', label: 'Mobile Apps' },
  { path: '/services', label: 'UI/UX Design' },
  { path: '/services', label: 'Enterprise' },
  { path: '/services', label: 'Cloud Services' },
];

const Footer = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-animate', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.1
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={sectionRef} className="relative bg-background border-t border-glass-border overflow-hidden">
      <div className="absolute top-0 left-0 h-[2px] w-2/5 bg-gradient-to-r from-transparent via-primary to-transparent animate-slideBar opacity-90" style={{ filter: 'blur(3px)', boxShadow: '0 0 20px rgba(139,92,246,0.6), 0 0 40px rgba(139,92,246,0.3)' }} />
      <div className="absolute top-0 left-0 h-px w-2/5 bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-slideBar" />

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-dark rounded-full filter blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="footer-animate">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center font-bold text-lg">O</div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Own</span>Tech<span className="text-primary">Solutions</span>
              </span>
            </Link>
            <p className="text-white/80 mb-6 leading-relaxed">
              Transforming ideas into powerful digital solutions. Your trusted technology partner for web, mobile, and enterprise development.
            </p>
            <div className="flex items-center gap-3">
              {[FiGithub, FiLinkedin, FiTwitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/80 hover:text-primary hover:border-primary/40 hover:shadow-[0_0_16px_rgba(139,92,246,0.35)] transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
              <a href="#" className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/20 hover:shadow-[0_0_16px_rgba(34,197,94,0.3)] transition-all duration-300">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div className="footer-animate">
            <h3 className="text-lg font-semibold mb-6 text-white/90">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-white/70 hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:[text-shadow:0_0_12px_rgba(139,92,246,0.5)]">
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-animate">
            <h3 className="text-lg font-semibold mb-6 text-white/90">Services</h3>
            <ul className="space-y-3">
              {services.map((service, i) => (
                <li key={i}>
                  <Link to={service.path} className="text-white/70 hover:text-primary transition-all duration-300 flex items-center gap-2 group hover:[text-shadow:0_0_12px_rgba(139,92,246,0.5)]">
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-animate">
            <h3 className="text-lg font-semibold mb-6 text-white/90">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <FiMapPin className="mt-1 text-primary shrink-0" />
                <span>Ahsanabad Apartments, Gulshan-e-Maymar, Karachi, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 hover:text-primary hover:[text-shadow:0_0_12px_rgba(139,92,246,0.5)] transition-all duration-300">
                <FiPhone className="text-primary shrink-0" />
                <span>+92 335 2546059</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 hover:text-primary hover:[text-shadow:0_0_12px_rgba(139,92,246,0.5)] transition-all duration-300">
                <FiMail className="text-primary shrink-0" />
                <span>freelancerb366@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <FiMessageCircle className="text-primary shrink-0" />
                <span>Live Chat Available</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-animate border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} OwnTechSolutions. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/50 hover:text-primary hover:[text-shadow:0_0_12px_rgba(139,92,246,0.5)] text-sm transition-all duration-300">Privacy Policy</a>
              <a href="#" className="text-white/50 hover:text-primary hover:[text-shadow:0_0_12px_rgba(139,92,246,0.5)] text-sm transition-all duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
