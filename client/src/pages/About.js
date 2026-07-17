import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiHeart, FiCheck, FiArrowRight, FiAward, FiUsers, FiGlobe, FiCode } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const timeline = [
  { year: '2020', title: 'Founded', desc: 'OwnTechSolutions was established with a vision to transform digital ideas into reality.' },
  { year: '2021', title: 'First Major Client', desc: 'Successfully delivered our first enterprise-level MERN stack application.' },
  { year: '2022', title: 'Team Expansion', desc: 'Grew to 15+ team members and expanded into Flutter mobile development.' },
  { year: '2023', title: '100+ Projects', desc: 'Reached the milestone of 100+ successful projects delivered globally.' },
  { year: '2024', title: 'Global Reach', desc: 'Expanded services to include AI-powered applications and cloud consulting.' },
  { year: '2025', title: 'Innovation Hub', desc: 'Launched our innovation lab focusing on emerging technologies and R&D.' },
];

const skills = [
  { name: 'MERN Stack', level: 98, icon: FiCode },
  { name: 'Flutter Mobile', level: 95, icon: FiUsers },
  { name: 'ASP.NET Core', level: 90, icon: FiGlobe },
  { name: 'UI/UX Design', level: 92, icon: FiHeart },
  { name: 'Cloud DevOps', level: 88, icon: FiAward },
  { name: 'AI & ML', level: 82, icon: FiAward },
];

function ThreeBackground() {
  return (
    <div className="absolute inset-0 opacity-40 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary/20 via-primary/10 to-transparent blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-radial from-purple-400/15 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] rounded-full bg-gradient-radial from-primary/10 via-transparent to-transparent blur-2xl" />
    </div>
  );
}

export default function About() {

  return (
    <div className="pt-32 pb-20">
      <section className="relative min-h-[60vh] flex items-center overflow-hidden mb-20">
        <ThreeBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <motion.span initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-primary text-sm font-medium tracking-widest uppercase">About Us</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-bold mt-4 mb-6">
              We Build <span className="gradient-text">Digital Excellence</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-xl text-text-secondary leading-relaxed">
              OwnTechSolutions is a professional software development agency based in Karachi, Pakistan. We specialize in MERN Stack Development, Flutter Mobile Development, ASP.NET Enterprise Solutions, UI/UX Design, and AI-Powered Applications.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FiTarget, title: 'Our Mission', desc: 'Helping businesses transform ideas into scalable digital products that drive growth and innovation.' },
            { icon: FiEye, title: 'Our Vision', desc: 'Become a trusted technology partner globally, known for delivering excellence and innovation.' },
            { icon: FiHeart, title: 'Why Choose Us', desc: 'Expert team, timely delivery, transparent communication, and unwavering commitment to quality.' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card group hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-6">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title">Our Expertise</h2>
          <p className="section-subtitle">Years of experience and continuous learning make us experts in our field</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <skill.icon className="text-primary" size={18} />
                  <span className="font-semibold">{skill.name}</span>
                </div>
                <span className="text-primary font-bold">{skill.level}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-background-card overflow-hidden">
                <motion.div initial={{ width: '0%' }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }} className="h-full rounded-full gradient-bg" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title">Our Journey</h2>
          <p className="section-subtitle">Milestones that shaped our growth and expertise</p>
        </motion.div>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />
          <div className="space-y-12">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                  <div className="card inline-block">
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    <p className="text-text-secondary">{item.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-center shrink-0">
                  <div className="w-8 h-8 rounded-full gradient-bg border-4 border-background flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-bold text-primary whitespace-nowrap">{item.year}</span>
                </div>
                <div className="flex-1 md:hidden">
                  <div className="card">
                    <span className="text-primary text-sm font-bold">{item.year}</span>
                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-text-secondary text-sm">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-[0.05] rounded-full blur-[100px]" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Ready to Start Your Project?</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Let's discuss your ideas and create something amazing together. Our team is ready to bring your vision to life.
          </p>
          <Link to="/chat" className="btn-primary group text-lg relative z-10">
            Let's Talk <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
