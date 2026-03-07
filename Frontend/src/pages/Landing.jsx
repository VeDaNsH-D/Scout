import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CircleCheck,
  Gauge,
  Radar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import logo from '../assets/logo.svg';
import './Landing.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Service', href: '#service' },
  { label: 'Tools', href: '#tools' },
  { label: 'Features', href: '#features' },
];

const partnerNames = ['Jasper', 'Canva', 'Virtoz', 'Aureka', 'Syntifi', 'Inodous'];

const overviewStats = [
  { value: '100+', label: 'Major Projects' },
  { value: '150k+', label: 'Clients' },
  { value: '23', label: 'Awards' },
  { value: '25', label: 'Years of Work' },
];

const heroProof = ['+37% reply rate', '2.4x pipeline velocity', 'SOC 2 ready architecture'];

const serviceCards = [
  {
    title: 'AI-Powered Automation',
    text: 'Orchestrate multi-step outreach with adaptive logic and role-aware message tuning.',
    image: '/landing/scout-service-automation.svg',
  },
  {
    title: 'Data-Driven Insights',
    text: 'Track behavioral signals and campaign quality metrics to improve every sequence.',
    image: '/landing/scout-service-insights.svg',
  },
  {
    title: 'Adaptive Campaign Control',
    text: 'Balance send velocity, inbox health, and follow-up cadence without manual effort.',
    image: '/landing/scout-service-control.svg',
  },
];

const whyPoints = [
  {
    title: 'AI That Learns & Evolves',
    text: 'Your system improves with every interaction and recommendation loop.',
    icon: Bot,
  },
  {
    title: 'Data-Driven Precision',
    text: 'High-confidence scoring and timing suggestions back every automation.',
    icon: Radar,
  },
  {
    title: 'Effortless Automation',
    text: 'Reduce repetitive work while preserving personalized communication quality.',
    icon: Gauge,
  },
  {
    title: 'Seamless Integration',
    text: 'Connect your outreach stack, workflows, and notifications in one surface.',
    icon: ShieldCheck,
  },
];

const processCards = [
  {
    tag: 'Step 01',
    title: 'Continuous Learning & Improvement',
  },
  {
    tag: 'Step 02',
    title: 'The system automatically improves itself with your interaction data',
  },
  {
    tag: 'Step 03',
    title: 'Efficiency boost across industries',
  },
];

const testimonials = [
  {
    quote:
      'Integrating this AI into our workflow was effortless, and now our communications are proactively optimized and decision-making has never been smarter.',
    name: 'Michael R',
    role: 'Product Innovation Lead',
  },
  {
    quote:
      'The automation quality and insights are exceptional. Our outreach team now spends more time closing and less time composing.',
    name: 'Nina K',
    role: 'Head of Revenue Ops',
  },
  {
    quote:
      'Within weeks we saw measurable improvements in response rate and campaign consistency across every segment.',
    name: 'Jordan T',
    role: 'Growth Marketing Director',
  },
];

const footerNav = ['About', 'Service', 'Tools', 'Contact'];
const heroVisual = '/landing/scout-hero-illustration.svg';
const aboutVisual = '/landing/scout-about-orb-illustration.svg';
const featureVisual = '/landing/scout-feature-logo.svg';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

function Landing() {
  return (
    <div className="venti-page" id="home">
      <div className="venti-noise" aria-hidden="true" />

      <header className="venti-nav-wrap">
        <nav className="venti-shell venti-nav">
          <Link to="/" className="venti-brand" aria-label="Scout home">
            <img src={logo} alt="Scout" className="venti-brand-logo" />
            <span>Scout</span>
          </Link>

          <div className="venti-nav-links">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <Link to="/login" className="venti-login-btn">
            Login
          </Link>
        </nav>
      </header>

      <main>
        <section className="venti-shell venti-hero">
          <motion.div
            className="venti-hero-copy"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8 }}
          >
            <p className="venti-kicker">Boutique intelligence, built for modern growth teams</p>
            <h1>
              Supercharge Your Business With <span className="venti-accent-word">AI</span> That Works Like
              a Charm.
            </h1>
            <p>
              Orchestrate outreach, personalize at scale, and turn every campaign into a reliable growth
              engine.
            </p>

            <div className="venti-hero-actions">
              <Link to="/signup" className="venti-btn venti-btn-primary">
                Get Started
              </Link>
              <a href="#features" className="venti-btn venti-btn-ghost">
                Learn More
                <ArrowRight size={15} />
              </a>
            </div>

            <div className="venti-proof-row" aria-label="Performance highlights">
              {heroProof.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="venti-hero-visual"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <img
              src={heroVisual}
              alt="Scout platform preview"
              className="venti-hero-image"
              loading="eager"
            />
            <div className="venti-hero-aurora" aria-hidden="true" />

            <div className="venti-floating-card venti-floating-card-left">
              <span className="venti-card-dot" />
              <div>
                <p>Node</p>
                <strong>Vision Sync</strong>
              </div>
            </div>

            <div className="venti-floating-card venti-floating-card-right">
              <span className="venti-card-dot" />
              <div>
                <p>Smart React</p>
                <strong>Control AI</strong>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="venti-shell venti-partners" aria-label="Trusted partners">
          {partnerNames.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </section>

        <section className="venti-shell venti-about" id="tools">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <span className="venti-pill">About us</span>
            <h2>Our AI-driven solutions are designed to learn, adapt, and grow with you.</h2>
            <p>
              Every interaction gets smarter over time, helping teams automate repetitive work and focus on
              the conversations that matter most.
            </p>
          </motion.div>

          <motion.div
            className="venti-orb-wrap"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, delay: 0.12 }}
          >
            <img src={aboutVisual} alt="Scout product visual" className="venti-orb-image" loading="lazy" />
          </motion.div>
        </section>

        <section className="venti-shell venti-stats">
          {overviewStats.map((item) => (
            <motion.article
              key={item.label}
              className="venti-stat-item"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7 }}
            >
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </motion.article>
          ))}
        </section>

        <section className="venti-shell venti-services" id="service">
          <motion.div
            className="venti-section-title"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8 }}
          >
            <span className="venti-pill">Service</span>
            <h2>AI That Works Like a Charm, One Memory at a Time</h2>
          </motion.div>

          <div className="venti-service-grid">
            {serviceCards.map((card, idx) => (
              <motion.article
                key={card.title}
                className="venti-service-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.75, delay: idx * 0.09 }}
              >
                <div className="venti-service-art">
                  <img src={card.image} alt={`${card.title} illustration`} loading="lazy" />
                </div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="venti-why" id="features">
          <div className="venti-shell">
            <motion.div
              className="venti-section-title venti-why-title"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.8 }}
            >
              <span className="venti-pill">Why choose us</span>
              <h2>AI That Works Like a Charm, One Memory at a Time</h2>
            </motion.div>

            <div className="venti-why-layout">
              <div className="venti-why-list">
                {whyPoints.slice(0, 2).map((point, idx) => {
                  const Icon = point.icon;
                  return (
                    <motion.article
                      key={point.title}
                      className="venti-why-card"
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.45 }}
                      transition={{ duration: 0.75, delay: idx * 0.08 }}
                    >
                      <Icon size={18} />
                      <h3>{point.title}</h3>
                      <p>{point.text}</p>
                    </motion.article>
                  );
                })}
              </div>

              <motion.div
                className="venti-orb-hero"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, delay: 0.08 }}
              >
                <img
                  src={featureVisual}
                  alt="Scout AI feature visual"
                  className="venti-orb-image venti-feature-logo-image"
                  loading="lazy"
                />
              </motion.div>

              <div className="venti-why-list">
                {whyPoints.slice(2).map((point, idx) => {
                  const Icon = point.icon;
                  return (
                    <motion.article
                      key={point.title}
                      className="venti-why-card"
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.45 }}
                      transition={{ duration: 0.75, delay: idx * 0.1 }}
                    >
                      <Icon size={18} />
                      <h3>{point.title}</h3>
                      <p>{point.text}</p>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="venti-shell venti-process" id="process">
          <motion.div
            className="venti-section-title"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8 }}
          >
            <span className="venti-pill">Process</span>
            <h2>Advancing AI, One Memory at a Time</h2>
          </motion.div>

          <div className="venti-process-grid">
            {processCards.map((card, idx) => (
              <motion.article
                key={card.title}
                className="venti-process-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.75, delay: idx * 0.1 }}
              >
                <span>{card.tag}</span>
                <h3>{card.title}</h3>
                <button type="button">Get Started</button>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="venti-shell venti-testimonials">
          <motion.div
            className="venti-section-title venti-testimonial-title"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8 }}
          >
            <h2>AI That Works Like a Charm, One Memory at a Time</h2>
            <p>
              Built for teams that need better decisions, faster campaigns, and deeply personalized customer
              journeys.
            </p>
          </motion.div>

          <div className="venti-testimonial-grid">
            {testimonials.map((item, idx) => (
              <motion.article
                key={item.name}
                className="venti-testimonial-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.75, delay: idx * 0.1 }}
              >
                <div className="venti-stars" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Sparkles key={star} size={14} />
                  ))}
                </div>
                <p>{item.quote}</p>
                <div className="venti-testimonial-user">
                  <span>{item.name}</span>
                  <small>{item.role}</small>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <footer className="venti-footer">
        <div className="venti-shell venti-footer-top">
          <div className="venti-subscribe">
            <input type="email" placeholder="Enter your email here" aria-label="Email address" />
            <button type="button">Subscribe</button>
          </div>

          <nav className="venti-footer-nav" aria-label="Footer navigation">
            {footerNav.map((item) => (
              <a href="#home" key={item}>
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="venti-shell venti-footer-main">
          <div className="venti-footer-brand">
            <img src={logo} alt="Scout" className="venti-brand-logo" />
            <span>Scout</span>
          </div>

          <div className="venti-footer-contact">
            <h4>Contact Us</h4>
            <p>+1 (669) 888-7748</p>
            <p>hello@scout.co</p>
          </div>

          <div className="venti-footer-contact">
            <h4>Location</h4>
            <p>40170 N. Indonesia</p>
            <p>shipping office, level 4</p>
          </div>

          <div className="venti-footer-contact">
            <h4>Language</h4>
            <p>En Fr Es It</p>
          </div>
        </div>

        <div className="venti-shell venti-footer-bottom">
          <span>Powered by AI automation infrastructure</span>
          <div className="venti-badges">
            <span>
              <CircleCheck size={14} />
              Stable
            </span>
            <span>
              <Bot size={14} />
              AI-first
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
