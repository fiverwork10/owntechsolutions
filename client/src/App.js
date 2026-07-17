import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Projects from './pages/Projects';
import FAQ from './pages/FAQ';
import ChatBot from './pages/ChatBot';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminContacts from './pages/admin/AdminContacts';
import AdminServices from './pages/admin/AdminServices';
import AdminChat from './pages/admin/AdminChat';
import AdminUsers from './pages/admin/AdminUsers';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import Cursor from './components/Cursor';

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lenis = window.__lenis;
    if (!lenis) return;
    const handler = () => setProgress(lenis.progress * 100);
    lenis.on('scroll', handler);
    return () => lenis.off('scroll', handler);
  }, []);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[3px] z-[200] pointer-events-none">
      <div
        className="w-full bg-gradient-to-b from-primary via-purple-400 to-primary transition-all duration-150 ease-out rounded-full"
        style={{ height: `${progress}%` }}
      />
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const lenisRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
      syncTouch: false,
    });
    lenis.resize();
    window.__lenis = lenis;
    lenisRef.current = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: false });
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => lenisRef.current?.resize();
    window.addEventListener('page-mounted', handler);
    return () => window.removeEventListener('page-mounted', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {!isAdmin && <Navbar />}
      {!isAdmin && <Cursor />}
      {!isAdmin && <ScrollProgress />}
      <main className="grow shrink-0 basis-auto">
        <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/projects" element={<ProtectedRoute><PageTransition><Projects /></PageTransition></ProtectedRoute>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><ChatBot /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/faqs" element={<AdminFAQs />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/contacts" element={<AdminContacts />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && location.pathname !== '/chat' && <Footer />}
    </div>
  );
}

export default App;
