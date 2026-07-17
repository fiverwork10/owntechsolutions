import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiPlay, FiPhone, FiMail, FiMapPin, FiSend, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/pagination';

const services = [
  { number: '01', title: 'MERN Stack Web Development', desc: 'Full-stack web applications using MongoDB, Express.js, React, and Node.js with modern architecture and best practices.', icon: '⚛️' },
  { number: '02', title: 'Mobile App Development', desc: 'Cross-platform mobile applications with Flutter and Dart, delivering native-like performance on iOS and Android.', icon: '📱' },
  { number: '03', title: 'Enterprise Applications', desc: 'Robust enterprise solutions with ASP.NET Core MVC, SQL Server, and cloud infrastructure on Azure & AWS.', icon: '🏢' },
  { number: '04', title: 'UI/UX Design', desc: 'User-centered design with Figma, creating intuitive interfaces that drive engagement and conversion.', icon: '🎨' },
  { number: '05', title: 'API Development', desc: 'Scalable RESTful and GraphQL APIs with secure authentication, documentation, and seamless integration.', icon: '🔗' },
  { number: '06', title: 'Cloud Deployment', desc: 'CI/CD pipelines, cloud infrastructure setup, monitoring, and optimization on AWS, Azure, and DigitalOcean.', icon: '☁️' },
];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Home() {
  const [contactSuccess, setContactSuccess] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    axios.get(`${API_URL}/api/testimonials`).then((res) => {
      if (res.data) setTestimonials(res.data);
    }).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contacts`, data);
      reset();
      setContactSuccess('Message sent successfully! We\'ll get back to you soon.');
      setTimeout(() => setContactSuccess(''), 5000);
    } catch (err) {
      setContactSuccess('Failed to send. Please try again.');
      console.error(err);
    }
  };

  return (
    <main>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-[60px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-[60px]" />

          <div className="hidden md:block absolute left-0 top-0 h-full w-[22%] overflow-hidden pointer-events-none z-0" aria-hidden="true" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/15 to-transparent blur-3xl opacity-70" />
            <svg className="relative w-full h-full opacity-40 md:opacity-60" viewBox="0 0 240 900" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.6))' }}>
              <defs>
                <linearGradient id="waveGradL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139,92,246,0)" />
                  <stop offset="35%" stopColor="rgba(139,92,246,0.6)" />
                  <stop offset="65%" stopColor="rgba(139,92,246,0.4)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
                <linearGradient id="waveGrad2L" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(167,139,250,0)" />
                  <stop offset="40%" stopColor="rgba(167,139,250,0.4)" />
                  <stop offset="60%" stopColor="rgba(167,139,250,0.3)" />
                  <stop offset="100%" stopColor="rgba(167,139,250,0)" />
                </linearGradient>
              </defs>
              {[
                { left: 8, path: 'M0,0 Q25,80 -20,180 T5,320 T-15,480 T10,620 T-6,800', delay: 0, dur: 12, grad: 'url(#waveGradL)' },
                { left: 48, path: 'M0,0 Q-30,90 25,190 T-6,350 T18,510 T-12,670 T8,850', delay: 0.8, dur: 14, grad: 'url(#waveGrad2L)' },
                { left: 88, path: 'M0,0 Q20,110 -18,220 T6,360 T-14,500 T12,640 T-5,800', delay: 1.6, dur: 11, grad: 'url(#waveGradL)' },
                { left: 128, path: 'M0,0 Q-25,95 28,195 T-8,380 T20,560 T-14,740 T10,900', delay: 2.4, dur: 13, grad: 'url(#waveGrad2L)' },
                { left: 168, path: 'M0,0 Q22,85 -18,185 T4,330 T-14,490 T10,630 T-6,800', delay: 3.2, dur: 11.5, grad: 'url(#waveGradL)' },
                { left: 208, path: 'M0,0 Q-28,100 22,200 T-8,360 T16,520 T-10,680 T6,850', delay: 4.0, dur: 12.5, grad: 'url(#waveGrad2L)' },
              ].map((w, i) => (
                <g key={i} transform={`translate(${w.left}, 0)`}>
                  <g className="wave-line" style={{ '--wave-delay': `${w.delay}s`, '--wave-dur': `${w.dur}s` }}>
                    <path d={w.path} stroke={w.grad} strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                </g>
              ))}
            </svg>
          </div>
          <div className="hidden md:block absolute right-0 top-0 h-full w-[22%] overflow-hidden pointer-events-none z-0" aria-hidden="true" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-l from-primary/25 via-primary/15 to-transparent blur-3xl opacity-70" />
            <svg className="relative w-full h-full opacity-40 md:opacity-60" viewBox="0 0 240 900" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.6))' }}>
              <defs>
                <linearGradient id="waveGradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(139,92,246,0)" />
                  <stop offset="35%" stopColor="rgba(139,92,246,0.6)" />
                  <stop offset="65%" stopColor="rgba(139,92,246,0.4)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
                <linearGradient id="waveGrad2R" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(167,139,250,0)" />
                  <stop offset="40%" stopColor="rgba(167,139,250,0.4)" />
                  <stop offset="60%" stopColor="rgba(167,139,250,0.3)" />
                  <stop offset="100%" stopColor="rgba(167,139,250,0)" />
                </linearGradient>
              </defs>
              {[
                { left: 8, path: 'M0,0 Q25,80 -20,180 T5,320 T-15,480 T10,620 T-6,800', delay: 0.6, dur: 12.5, grad: 'url(#waveGradR)' },
                { left: 48, path: 'M0,0 Q-30,90 25,190 T-6,350 T18,510 T-12,670 T8,850', delay: 1.4, dur: 10.5, grad: 'url(#waveGrad2R)' },
                { left: 88, path: 'M0,0 Q20,110 -18,220 T6,360 T-14,500 T12,640 T-5,800', delay: 2.2, dur: 13.5, grad: 'url(#waveGradR)' },
                { left: 128, path: 'M0,0 Q-25,95 28,195 T-8,380 T20,560 T-14,740 T10,900', delay: 3.0, dur: 11, grad: 'url(#waveGrad2R)' },
                { left: 168, path: 'M0,0 Q22,85 -18,185 T4,330 T-14,490 T10,630 T-6,800', delay: 3.8, dur: 15, grad: 'url(#waveGradR)' },
                { left: 208, path: 'M0,0 Q-28,100 22,200 T-8,360 T16,520 T-10,680 T6,850', delay: 4.6, dur: 12, grad: 'url(#waveGrad2R)' },
              ].map((w, i) => (
                <g key={i} transform={`translate(${w.left}, 0)`}>
                  <g className="wave-line" style={{ '--wave-delay': `${w.delay}s`, '--wave-dur': `${w.dur}s` }}>
                    <path d={w.path} stroke={w.grad} strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                </g>
              ))}
            </svg>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} style={{ willChange: 'transform, opacity' }} className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8 lg:px-12 max-w-6xl mx-auto gap-3 md:gap-5">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none md:leading-tight tracking-tight break-words" style={{ textShadow: '0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.12), 0 0 120px rgba(139,92,246,0.06)' }}>
            Transforming Ideas Into{' '}
            <span className="gradient-text" style={{ textShadow: '0 0 30px rgba(139,92,246,0.6), 0 0 80px rgba(139,92,246,0.3), 0 0 150px rgba(139,92,246,0.15)' }}>Powerful Digital</span>{' '}
            Solutions
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60 my-2 md:my-3" />
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-primary-light text-sm sm:text-base">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Welcome to OwnTechSolutions
          </div>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl leading-relaxed font-light">
            MERN Stack Development, Mobile Applications, Enterprise Solutions & UI/UX Design. We build digital products that drive business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-2 md:mt-4">
            <Link to="/services" className="btn-primary group text-base sm:text-lg md:text-xl px-6 md:px-8 py-3 md:py-4">
              Get Started <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/projects" className="btn-secondary group text-base sm:text-lg md:text-xl px-6 md:px-8 py-3 md:py-4">
              <FiPlay /> View Portfolio
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative py-16 md:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary opacity-[0.03] rounded-full blur-[100px] md:blur-[150px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-20">
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle !text-gray-300">Comprehensive digital solutions tailored to elevate your business in the modern technology landscape</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative card cursor-pointer overflow-hidden"
                onClick={() => setSelectedService(service)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">{service.icon}</span>
                  <span className="text-6xl font-black text-primary/10 absolute top-4 right-4 select-none">{service.number}</span>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{service.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    Learn More <FiArrowRight />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { number: 150, suffix: '+', label: 'Projects Delivered' },
              { number: 50, suffix: '+', label: 'Happy Clients' },
              { number: 5, suffix: '+', label: 'Years Experience' },
              { number: 24, suffix: '/7', label: 'Support Available' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  <CountUp to={stat.number} />{stat.suffix}
                </div>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle !text-gray-300">Trusted by businesses across Pakistan to deliver exceptional digital solutions</p>
          </motion.div>
          {testimonials.length === 0 ? (
            <div className="text-center py-12 text-white/30">No testimonials yet.</div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary' }}
              className="pb-14"
            >
              {testimonials.map((t, i) => (
                <SwiperSlide key={t._id || i}>
                  <div className="card h-full group hover:border-primary/30 transition-all duration-500 flex flex-col">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-primary/30 to-purple-900/30 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        {t.photo ? (
                          <img src={t.photo} alt={t.clientName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary">
                            {t.clientName[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base text-white truncate">{t.clientName}</p>
                        <p className="text-gray-400 text-xs md:text-sm truncate">{t.position ? `${t.position}, ` : ''}{t.company}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <FaStar key={j} className={j < t.rating ? 'text-yellow-500' : 'text-gray-600'} size={13} />
                      ))}
                    </div>
                    <div className="relative flex-1">
                      <FaQuoteLeft className="absolute -top-1 -left-1 text-2xl text-primary/10" />
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4 pl-5">"{t.review}"</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      <section id="contact" className="relative py-16 md:py-32">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary rounded-full blur-[80px] md:blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle !text-gray-300">Have a project in mind? Let's discuss how we can help you achieve your goals</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="space-y-6 mb-10">
                {[
                  { icon: FiPhone, label: 'Phone', value: '+92 335 2546059', href: 'tel:+923352546059' },
                  { icon: FaWhatsapp, label: 'WhatsApp', value: '+92 335 2546059', href: 'https://wa.me/923352546059' },
                  { icon: FiMail, label: 'Email', value: 'freelancerb366@gmail.com', href: 'mailto:freelancerb366@gmail.com' },
                  { icon: FiMapPin, label: 'Location', value: 'Ahsanabad Apartments, Gulshan-e-Maymar, Karachi', href: '#' },
                ].map((item, i) => (
                  <a key={i} href={item.href} className="flex items-center gap-4 p-4 rounded-2xl glass hover:bg-primary/10 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{item.label}</p>
                      <p className="font-medium group-hover:text-primary transition-colors">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden h-[200px] md:h-[300px] glass">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.0!2d67.0!3d24.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDU0JzAwLjAiTiA2N8KwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" className="opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {contactSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                  {contactSuccess}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input {...register('name', { required: true })} placeholder="Your Name" className="input-field" />
                    {errors.name && <p className="text-error text-sm mt-1">Name is required</p>}
                  </div>
                  <div>
                    <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} placeholder="Your Email" className="input-field" />
                    {errors.email && <p className="text-error text-sm mt-1">Valid email required</p>}
                  </div>
                </div>
                <input {...register('subject', { required: true })} placeholder="Subject" className="input-field" />
                <textarea {...register('message', { required: true })} placeholder="Your Message" rows={5} className="input-field resize-none" />
                <button type="submit" className="btn-primary w-full group text-lg">
                  <FiSend className="group-hover:translate-x-1 transition-transform" /> Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-strong rounded-3xl p-6 md:p-10 max-w-lg w-full relative mx-4 border border-primary/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => setSelectedService(null)} className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-12 h-12 rounded-full glass flex items-center justify-center text-gray-300 hover:text-white transition-all hover:border-primary/30 hover:bg-primary/10 cursor-pointer z-10">
                <FiX />
              </button>
              <span className="text-6xl block mb-4">{selectedService.icon}</span>
              <span className="text-5xl font-black text-primary/10 absolute top-6 right-6 select-none">{selectedService.number}</span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">{selectedService.title}</h3>
              <div className="w-12 h-1 bg-primary rounded-full mb-4" />
              <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                {selectedService.desc}
              </p>
              <Link
                to="/services"
                onClick={() => setSelectedService(null)}
                className="btn-primary mt-6 inline-flex items-center gap-2 group"
              >
                View All Services <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function CountUp({ to }) {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    let start = 0;
    if (start === to) return;
    const increment = to / 50;
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 40);
    return () => clearInterval(timer);
  }, [to]);
  return <>{count}</>;
}

export default Home;