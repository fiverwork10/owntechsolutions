import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function ContactUs() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [contactSuccess, setContactSuccess] = useState('');

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:5000/api/contacts', data);
      reset();
      setContactSuccess('Message sent successfully! We\'ll get back to you soon.');
      setTimeout(() => setContactSuccess(''), 5000);
    } catch (err) {
      setContactSuccess('Failed to send. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary rounded-full blur-[80px] md:blur-[150px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Get In Touch</h2>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto">Have a project in mind? Let's discuss how we can help you achieve your goals</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="space-y-6 mb-10">
              {[
                { icon: FiPhone, label: 'Phone', value: '+92 335 2546059', href: 'tel:+923352546059' },
                { icon: FaWhatsapp, label: 'WhatsApp', value: '+92 335 2546059', href: 'https://wa.me/923352546059' },
                { icon: FiMail, label: 'Email', value: 'freelancerb366@gmail.com', href: 'mailto:freelancerb366@gmail.com' },
                { icon: FiMapPin, label: 'Location', value: 'Ahsanabad Apartments, Gulshan-e-Maymar, Karachi', href: '#' },
              ].map((item, i) => (
                <a key={i} href={item.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl glass hover:bg-primary/10 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">{item.label}</p>
                    <p className="font-medium group-hover:text-primary transition-colors">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden h-[200px] md:h-[300px] glass">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.0!2d67.0!3d24.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDU0JzAwLjAiTiA2N8KwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" className="opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            {contactSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{contactSuccess}</div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <input {...register('name', { required: true })} placeholder="Your Name" className="input-field" />
                  {errors.name && <p className="text-red-400 text-sm mt-1">Name is required</p>}
                </div>
                <div>
                  <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} placeholder="Your Email" className="input-field" />
                  {errors.email && <p className="text-red-400 text-sm mt-1">Valid email required</p>}
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
    </div>
  );
}