import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

const categories = ['all', 'mern', 'mobile', 'flutter', 'react', 'nodejs', 'mongodb', 'aspnet', 'ui-ux', 'pricing', 'hosting', 'deployment', 'maintenance', 'security', 'seo', 'timelines', 'general'];

const categoryLabels = {
  all: 'All', mern: 'MERN Stack', mobile: 'Mobile Apps', flutter: 'Flutter',
  react: 'React.js', nodejs: 'Node.js', mongodb: 'MongoDB', aspnet: 'ASP.NET',
  'ui-ux': 'UI/UX Design', pricing: 'Pricing', hosting: 'Hosting',
  deployment: 'Deployment', maintenance: 'Maintenance', security: 'Security',
  seo: 'SEO', timelines: 'Timelines', general: 'General'
};

const faqsData = [
  // MERN Stack
  { q: 'What is MERN Stack development?', a: 'MERN Stack is a popular JavaScript framework for building full-stack web applications using MongoDB, Express.js, React.js, and Node.js. It allows developers to use JavaScript for both frontend and backend development.', cat: 'mern' },
  { q: 'Why choose MERN Stack for my project?', a: 'MERN offers fast development, excellent performance, scalability, a huge community, and the ability to use a single language (JavaScript) across the entire application stack.', cat: 'mern' },
  { q: 'How long does it take to build a MERN application?', a: 'Timelines vary from 2-3 weeks for a basic CRUD app to 3-6 months for complex enterprise platforms. We provide detailed timelines during consultation.', cat: 'mern', tag: 'timelines' },
  { q: 'Can you integrate third-party APIs with MERN?', a: 'Yes, we have extensive experience integrating payment gateways, social media APIs, mapping services, email services, and other third-party APIs.', cat: 'mern' },
  { q: 'Do you provide MERN stack maintenance?', a: 'Yes, we offer comprehensive maintenance packages including updates, security patches, performance optimization, and feature additions.', cat: 'mern' },
  { q: 'What authentication methods do you implement?', a: 'We implement JWT (JSON Web Tokens), OAuth 2.0, social login (Google, Facebook), and multi-factor authentication as per project requirements.', cat: 'mern' },
  { q: 'Can you build real-time applications with MERN?', a: 'Absolutely! We use Socket.io for real-time features like live chat, notifications, collaborative editing, and real-time data updates.', cat: 'mern' },
  { q: 'What is the typical cost of a MERN project?', a: 'Basic MERN applications start from PKR 40,000. Complex enterprise solutions may range from PKR 150,000 to PKR 500,000+.', cat: 'mern' },

  // Mobile
  { q: 'What mobile platforms do you develop for?', a: 'We develop for both iOS and Android platforms using Flutter, ensuring native-like performance and consistent user experience across devices.', cat: 'mobile' },
  { q: 'How is Flutter different from React Native?', a: 'Flutter uses Dart language and provides better performance, more customizable widgets, and single codebase for both platforms. React Native uses JavaScript bridges.', cat: 'mobile' },
  { q: 'Can you publish apps to the App Store and Google Play?', a: 'Yes, we handle the entire app store submission process including preparing required assets, meeting guidelines, and managing updates.', cat: 'mobile' },
  { q: 'Do you provide app maintenance after launch?', a: 'Yes, we offer post-launch support including bug fixes, OS updates, feature enhancements, and performance monitoring.', cat: 'mobile' },
  { q: 'Can you integrate push notifications?', a: 'Yes, we implement push notifications using Firebase Cloud Messaging (FCM) for Android and APNs for iOS devices.', cat: 'mobile' },
  { q: 'What payment gateways can be integrated?', a: 'We integrate Stripe, PayPal, JazzCash, Easypaisa, and local payment solutions depending on your target market.', cat: 'mobile' },

  // React
  { q: 'Why should I use React.js for my frontend?', a: 'React offers component-based architecture, virtual DOM for fast rendering, rich ecosystem, excellent developer tools, and strong community support.', cat: 'react' },
  { q: 'Do you use React Hooks or Class Components?', a: 'We exclusively use React Hooks and functional components for modern, cleaner, and more maintainable code.', cat: 'react' },
  { q: 'What state management solutions do you use?', a: 'We use Redux Toolkit, Context API, Zustand, or Recoil depending on project complexity and requirements.', cat: 'react' },
  { q: 'Can you build Progressive Web Apps (PWAs)?', a: 'Yes, we build PWAs using React that work offline, send push notifications, and provide native app-like experience.', cat: 'react' },
  { q: 'Do you implement server-side rendering?', a: 'Yes, we use Next.js for SSR when SEO and initial load performance are critical requirements.', cat: 'react' },

  // Node.js
  { q: 'Why Node.js for backend development?', a: 'Node.js offers non-blocking I/O, excellent for real-time apps, great npm ecosystem, and allows using JavaScript end-to-end.', cat: 'nodejs' },
  { q: 'How do you handle API security in Node.js?', a: 'We implement rate limiting, input validation, CORS policies, helmet.js, encryption, and regular security audits.', cat: 'nodejs' },
  { q: 'Can you build microservices with Node.js?', a: 'Yes, we design and implement microservices architecture using Node.js with message queues (RabbitMQ, Redis) for inter-service communication.', cat: 'nodejs' },
  { q: 'What testing frameworks do you use?', a: 'We use Jest, Mocha, Chai, and Supertest for unit testing, integration testing, and end-to-end testing of Node.js applications.', cat: 'nodejs' },
  { q: 'How do you manage environment configurations?', a: 'We use dotenv for environment variables, different config files for dev/staging/production, and secret management tools.', cat: 'nodejs' },

  // MongoDB
  { q: 'Why use MongoDB over SQL databases?', a: 'MongoDB offers flexible schema, horizontal scaling, fast queries for unstructured data, and excellent integration with Node.js.', cat: 'mongodb' },
  { q: 'How do you design MongoDB schemas?', a: 'We follow best practices for schema design, indexing strategies, data modeling, and optimization based on your application\'s access patterns.', cat: 'mongodb' },
  { q: 'Do you provide MongoDB optimization?', a: 'Yes, we optimize queries with proper indexing, aggregation pipelines, connection pooling, and sharding for large-scale applications.', cat: 'mongodb' },
  { q: 'How do you handle MongoDB backups?', a: 'We set up automated backups using mongodump, replica sets, and cloud backup solutions with point-in-time recovery capabilities.', cat: 'mongodb' },
  { q: 'Can you migrate from SQL to MongoDB?', a: 'Yes, we have experience migrating legacy SQL databases to MongoDB while ensuring data integrity and minimal downtime.', cat: 'mongodb' },

  // ASP.NET
  { q: 'What is ASP.NET Core MVC?', a: 'ASP.NET Core MVC is Microsoft\'s modern web framework for building enterprise-grade applications with C#, offering robust security and performance.', cat: 'aspnet' },
  { q: 'Why choose ASP.NET for enterprise applications?', a: 'ASP.NET offers excellent performance, strong typing, enterprise-level security, seamless Azure integration, and great tooling with Visual Studio.', cat: 'aspnet' },
  { q: 'Do you integrate ASP.NET with modern frontends?', a: 'Yes, we build ASP.NET backends with React, Angular, or Vue.js frontends for modern, decoupled architecture.', cat: 'aspnet' },
  { q: 'Can you migrate legacy .NET apps to .NET Core?', a: 'Yes, we provide migration services from .NET Framework to .NET Core/6/7/8 with minimal disruption.', cat: 'aspnet' },
  { q: 'What databases work with ASP.NET?', a: 'ASP.NET Core works great with SQL Server, PostgreSQL, MySQL, and MongoDB through Entity Framework Core or Dapper.', cat: 'aspnet' },

  // UI/UX
  { q: 'What is your UI/UX design process?', a: 'Our process includes research, wireframing, prototyping, visual design, usability testing, and iterative refinement based on user feedback.', cat: 'ui-ux' },
  { q: 'Do you create design systems?', a: 'Yes, we create comprehensive design systems with component libraries, style guides, and documentation for consistent branding.', cat: 'ui-ux' },
  { q: 'What tools do you use for design?', a: 'We primarily use Figma for collaborative design, along with Adobe Creative Suite, Canva, and prototyping tools.', cat: 'ui-ux' },
  { q: 'How do you ensure responsive design?', a: 'We design mobile-first, use flexible grids, test on multiple devices, and follow accessibility guidelines (WCAG).', cat: 'ui-ux' },
  { q: 'Can you redesign my existing website?', a: 'Absolutely! We offer website redesign services to modernize your online presence with contemporary UI/UX best practices.', cat: 'ui-ux' },

  // Pricing
  { q: 'How do you price your services?', a: 'We price based on project complexity, features, number of pages/screens, integrations, timeline, and ongoing maintenance requirements.', cat: 'pricing' },
  { q: 'Do you offer fixed-price contracts?', a: 'Yes, for well-defined projects we offer fixed-price contracts. For ongoing work, we provide hourly rates or monthly retainers.', cat: 'pricing' },
  { q: 'What is included in the project cost?', a: 'Our quotes include development, design, testing, deployment, basic documentation, and a warranty period for bug fixes.', cat: 'pricing' },
  { q: 'Do you charge for revisions?', a: 'We include a reasonable number of revisions in our quotes. Additional revisions beyond the scope are billed separately.', cat: 'pricing' },
  { q: 'What payment terms do you offer?', a: 'We typically require 50% advance payment with milestones-based payments for larger projects. We accept bank transfers and local payment methods.', cat: 'pricing' },

  // Hosting
  { q: 'What hosting options do you recommend?', a: 'We recommend AWS, Vercel, Netlify, DigitalOcean, or Azure depending on project requirements and scale.', cat: 'hosting' },
  { q: 'Do you manage hosting setup?', a: 'Yes, we handle complete hosting setup including server configuration, SSL certificates, domain setup, and CDN integration.', cat: 'hosting' },
  { q: 'What is your hosting fee?', a: 'We charge a setup fee plus monthly management fee. Actual hosting costs depend on the chosen provider and plan.', cat: 'hosting' },
  { q: 'Can you migrate my site to new hosting?', a: 'Yes, we provide migration services with minimal downtime and ensure all data and configurations are preserved.', cat: 'hosting' },

  // Deployment
  { q: 'What is your deployment process?', a: 'We use CI/CD pipelines (GitHub Actions, GitLab CI) for automated testing and deployment to staging and production environments.', cat: 'deployment' },
  { q: 'Do you provide one-click deployment?', a: 'Yes, we set up automated deployment pipelines so you can deploy with a single git push or click.', cat: 'deployment' },
  { q: 'How do you handle database migrations?', a: 'We use migration tools and scripts to manage database schema changes safely across environments.', cat: 'deployment' },
  { q: 'Do you provide deployment documentation?', a: 'Yes, we provide comprehensive deployment documentation including architecture diagrams, configuration details, and runbooks.', cat: 'deployment' },

  // Maintenance
  { q: 'What does maintenance include?', a: 'Maintenance includes bug fixes, security updates, performance monitoring, database optimization, and feature enhancements.', cat: 'maintenance' },
  { q: 'How much does maintenance cost?', a: 'Monthly maintenance typically costs 10-15% of the original development cost, depending on the scope of support needed.', cat: 'maintenance' },
  { q: 'Do you offer emergency support?', a: 'Yes, we offer 24/7 emergency support for critical issues with defined SLAs based on your support package.', cat: 'maintenance' },
  { q: 'How quickly do you respond to issues?', a: 'Response times vary by severity: critical issues within 2 hours, major within 8 hours, minor within 24 hours.', cat: 'maintenance' },

  // Security
  { q: 'How do you ensure application security?', a: 'We follow OWASP guidelines, implement HTTPS, input validation, CSRF protection, XSS prevention, and regular security audits.', cat: 'security' },
  { q: 'Do you perform security testing?', a: 'Yes, we conduct vulnerability assessments, penetration testing, and code reviews to identify and fix security issues.', cat: 'security' },
  { q: 'How do you protect user data?', a: 'We encrypt sensitive data at rest and in transit, implement proper access controls, and follow data protection regulations.', cat: 'security' },
  { q: 'Do you offer GDPR compliance?', a: 'Yes, we can help make your application GDPR compliant with proper consent management, data handling, and privacy controls.', cat: 'security' },

  // SEO
  { q: 'Do you optimize websites for SEO?', a: 'Yes, we implement on-page SEO including meta tags, semantic HTML, structured data, sitemaps, and performance optimization.', cat: 'seo' },
  { q: 'Can you integrate SEO tools?', a: 'Yes, we integrate Google Analytics, Search Console, and other SEO tools for monitoring and optimization.', cat: 'seo' },
  { q: 'Do you provide SEO-optimized content structure?', a: 'Yes, we structure content with proper heading hierarchy, keyword optimization, and internal linking strategies.', cat: 'seo' },
  { q: 'How do you improve website speed for SEO?', a: 'We optimize images, implement lazy loading, use CDN, enable caching, minify assets, and optimize database queries.', cat: 'seo' },

  // Timelines
  { q: 'How long does a typical website take?', a: 'A simple 5-page website takes 2-3 weeks. Complex web applications can take 2-6 months depending on features.', cat: 'timelines' },
  { q: 'How long does a mobile app take?', a: 'A basic mobile app typically takes 4-8 weeks. Complex apps with many features can take 3-6 months.', cat: 'timelines' },
  { q: 'What factors affect project timeline?', a: 'Timelines depend on project complexity, number of features, integrations, design revisions, client feedback speed, and team availability.', cat: 'timelines' },
  { q: 'Can you expedite development?', a: 'Yes, we offer expedited development with additional resources for an accelerated timeline, though this may increase costs.', cat: 'timelines' },
  { q: 'How do you handle project delays?', a: 'We communicate delays immediately, provide revised timelines, and work to minimize impact on project delivery.', cat: 'timelines' },

  // General
  { q: 'How can I contact OwnTechSolutions?', a: 'You can reach us via phone at +92 335 2546059, email at freelancerb366@gmail.com, WhatsApp, or through our live chat.', cat: 'general' },
  { q: 'Where is your office located?', a: 'Our office is located at Ahsanabad Apartments, Gulshan-e-Maymar, Karachi, Pakistan.', cat: 'general' },
  { q: 'Do you work with international clients?', a: 'Yes, we work with clients worldwide. Our team is experienced in remote collaboration across different time zones.', cat: 'general' },
  { q: 'What is your refund policy?', a: 'We offer milestone-based payments. Refunds are provided according to the terms specified in our service agreement.', cat: 'general' },
  { q: 'How do I start a project with you?', a: 'Simply reach out via our contact form, chat, or phone. We\'ll schedule a free consultation to discuss your requirements and provide a quote.', cat: 'general' },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  const filteredFAQs = useMemo(() => {
    return faqsData.filter(faq => {
      const matchCategory = activeCategory === 'all' || faq.cat === activeCategory;
      const matchSearch = !search ||
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

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
          <AnimatePresence>
            {filteredFAQs.map((faq, i) => (
              <motion.div
                key={i}
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
                    <span className="text-xs text-primary font-medium mb-1 block">{categoryLabels[faq.cat]}</span>
                    <h3 className="font-medium text-sm md:text-base">{faq.q}</h3>
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
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredFAQs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">No FAQs found matching your search</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-primary mt-2 hover:underline">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
