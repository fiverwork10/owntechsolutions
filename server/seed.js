const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Testimonial = require('./models/Testimonial');
const FAQ = require('./models/FAQ');
const Service = require('./models/Service');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await Testimonial.deleteMany({});
    await FAQ.deleteMany({});
    await Service.deleteMany({});

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@owntechsolutions.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('Admin user created: admin@owntechsolutions.com / admin123');

    const testimonials = [
      { clientName: 'Ahmed Khan', company: 'TechVentures Pakistan', position: 'CEO', review: 'OwnTechSolutions delivered our e-commerce platform ahead of schedule. The MERN stack implementation was flawless and the UI/UX design exceeded our expectations. Their team was professional, communicative, and truly understood our vision.', rating: 5, isFeatured: true, order: 1 },
      { clientName: 'Sarah Ahmed', company: 'Digital Pulse', position: 'CTO', review: 'Professional team with deep technical expertise. They transformed our legacy system into a modern, scalable application. Highly recommended for enterprise-level projects!', rating: 5, isFeatured: true, order: 2 },
      { clientName: 'Usman Ali', company: 'InnovateTech', position: 'Product Manager', review: 'The mobile app they built for us using Flutter is amazing. Cross-platform performance is outstanding and the team was very responsive throughout the development process.', rating: 5, isFeatured: true, order: 3 },
      { clientName: 'Fatima Zafar', company: 'CloudBase Solutions', position: 'Director', review: 'Outstanding enterprise solution development. Their ASP.NET expertise helped us build a robust system that handles millions of transactions daily with zero downtime.', rating: 5, isFeatured: true, order: 4 },
      { clientName: 'Hassan Raza', company: 'WebCraft Agency', position: 'Founder', review: 'Best UI/UX design team we have worked with. They understood our vision perfectly and created an interface that our users love. The design thinking approach made all the difference.', rating: 4, isFeatured: false, order: 5 },
    ];
    await Testimonial.insertMany(testimonials);
    console.log('Testimonials seeded');

    const faqs = [
      { question: 'What is MERN Stack development?', answer: 'MERN Stack is a popular JavaScript framework for building full-stack web applications using MongoDB, Express.js, React.js, and Node.js.', category: 'mern', order: 1 },
      { question: 'How long does it take to build a MERN application?', answer: 'Timelines vary from 2-3 weeks for a basic CRUD app to 3-6 months for complex enterprise platforms.', category: 'timelines', order: 2 },
      { question: 'What mobile platforms do you develop for?', answer: 'We develop for both iOS and Android platforms using Flutter, ensuring native-like performance.', category: 'mobile', order: 3 },
      { question: 'How do you price your services?', answer: 'We price based on project complexity, features, integrations, and timeline requirements.', category: 'pricing', order: 4 },
      { question: 'Do you provide hosting services?', answer: 'Yes, we offer complete hosting setup including server configuration, SSL certificates, and CDN integration.', category: 'hosting', order: 5 },
    ];
    await FAQ.insertMany(faqs);
    console.log('FAQs seeded');

    const services = [
      { title: 'MERN Stack Development', price: 'PKR 40,000+', description: 'Full-stack web applications built with the modern MERN stack. From simple landing pages to complex enterprise platforms.', icon: 'FiCode', color: '#8B5CF6', features: ['Authentication', 'Admin Panel', 'REST APIs', 'Responsive Design', 'Database Design', 'Real-time Features'], technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Redux', 'Socket.io'], order: 1 },
      { title: 'Mobile App Development', price: 'PKR 35,000+', description: 'Beautiful, high-performance mobile applications for both iOS and Android using Flutter framework.', icon: 'FiSmartphone', color: '#A78BFA', features: ['Cross-platform', 'Native Performance', 'Push Notifications', 'Offline Support', 'App Store Deployment', 'Analytics'], technologies: ['Flutter', 'Dart', 'Firebase', 'SQLite', 'REST APIs', 'Bloc/Cubit'], order: 2 },
      { title: 'UI/UX Design', price: 'PKR 10,000+', description: 'User-centered design that creates intuitive, engaging experiences. We design interfaces that users love.', icon: 'FiLayout', color: '#C084FC', features: ['Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Usability Testing', 'Interaction Design'], technologies: ['Figma', 'Canva', 'Adobe XD', 'Framer', 'After Effects', 'Miro'], order: 3 },
      { title: 'Enterprise Applications', price: 'PKR 70,000+', description: 'Robust enterprise-grade solutions built with Microsoft technologies. Secure, scalable, and reliable.', icon: 'FiServer', color: '#6D28D9', features: ['Scalable Architecture', 'Security', 'Integration', 'Reporting', 'Multi-tenancy', 'Audit Logging'], technologies: ['ASP.NET Core', 'SQL Server', 'Azure', 'AWS', 'Entity Framework', 'Microservices'], order: 4 },
      { title: 'API Development', price: 'PKR 25,000+', description: 'Scalable and secure APIs that power your applications. We build robust backend services.', icon: 'FiCloud', color: '#7C3AED', features: ['RESTful APIs', 'GraphQL', 'Authentication', 'Documentation', 'Rate Limiting', 'Testing'], technologies: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker'], order: 5 },
      { title: 'Cloud Deployment', price: 'PKR 20,000+', description: 'Professional cloud infrastructure setup and deployment services. We ensure your applications run smoothly.', icon: 'FiDatabase', color: '#9333EA', features: ['CI/CD Pipelines', 'Auto-scaling', 'Monitoring', 'Backup & Recovery', 'Security', 'Optimization'], technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'], order: 6 },
    ];
    await Service.insertMany(services);
    console.log('Services seeded');

    console.log('\nDatabase seeded successfully!');
    console.log('Admin login: admin@owntechsolutions.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
