import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import './Home.css';

export default function Home({ onNavigate, theme, setTheme }) {
  const handleGetStarted = () => {
    onNavigate('signup');
  };

  return (
    <div className="home-wrapper">
      <Helmet>
        <title>PrimeSmsHub - Premium SMS Verification & Virtual Numbers Worldwide</title>
        <meta name="description" content="PrimeSmsHub: Secure, fast, and reliable SMS verification service. Get virtual numbers for any service including WhatsApp, Telegram, Google, and more. Available worldwide at the best rates." />
        <meta name="canonical" content="https://primesmshub.space/" />
        <link rel="alternate" hreflang="en" href="https://primesmshub.space/" />
        <link rel="alternate" hreflang="en-NG" href="https://ng.primesmshub.space/" />
        <link rel="alternate" hreflang="x-default" href="https://primesmshub.space/" />
      </Helmet>
      <Navbar onNavigate={onNavigate} theme={theme} setTheme={setTheme} />

      <main className="landing-content">
        {/* Animated Background Elements */}
        <div className="bg-decorations">
          <div className="glow-sphere sphere-1">hey</div>
          <div className="glow-sphere sphere-2"></div>
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
        </div>

        <section className="hero">
          <div className="container hero-container">
            <div className="hero-text">
              <div className="hero-badge fade-in">
                <span className="dot"></span>
                Instant SMS Delivery
              </div>
              <h1 className="hero-title fade-in-up">
                Verify more for less with <span className="text-gradient">PrimeSmsHub</span>
              </h1>
              <p className="hero-description fade-in-up delay-1">
                Protect your online identity with premium virtual numbers. Reliable, affordable, and instant global delivery for all your verification needs.
              </p>
              <div className="hero-actions fade-in-up delay-2">
                <button className="btn primary glow-btn" onClick={handleGetStarted}>
                  Get Started Now
                  <span className="arrow">→</span>
                </button>
                <button className="btn secondary outline-btn" onClick={() => onNavigate('signup')}>
                  Create Account
                </button>
              </div>
            </div>

            <div className="hero-visual fade-in delay-2">
              <div className="dashboard-preview card glass">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="preview-url">primesmshub.com/dashboard</div>
                </div>
                <div className="preview-content">
                  <img src="/hero.png" alt="PrimeSmsHub Dashboard" />
                  <div className="preview-overlay"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Global Connectivity, <span className="text-gradient">Simplified</span></h2>
              <p className="section-subtitle">Everything you need for secure and private online identity verification.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card glass">
                <div className="feature-icon">🛡️</div>
                <h3>Privacy First</h3>
                <p>Keep your personal number safe from trackers and data brokers using our non-VoIP virtual numbers.</p>
              </div>
              <div className="feature-card glass">
                <div className="feature-icon">🌍</div>
                <h3>Global Range</h3>
                <p>Access numbers from over 500+ countries and thousands of services including WhatsApp, Telegram, and Google.</p>
              </div>
              <div className="feature-card glass">
                <div className="feature-icon">⚡</div>
                <h3>Instant Delivery</h3>
                <p>No waiting around. SMS codes are delivered in real-time through our high-performance infrastructure.</p>
              </div>
              <div className="feature-card glass">
                <div className="feature-icon">💎</div>
                <h3>Fixed Pricing</h3>
                <p>Transparent pricing starting at just $0.02. No hidden fees, no price fluctuations.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid glass">
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">Countries Support</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">1M+</span>
                <span className="stat-label">SMS Delivered</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">System Uptime</span>
              </div>
            </div>
          </div>
        </section>



        <section id="about" className="cta-section">
          <div className="container">
            <div className="cta-card glass glow-border">
              <div className="cta-content">
                <h2>Ready to secure your online identity?</h2>
                <p>Join thousands of users who trust PrimeSmsHub for their private verification needs.</p>
                <div className="cta-buttons">
                  <button className="btn primary" onClick={handleGetStarted}>Get Started for Free</button>
                  <button className="btn secondary" onClick={() => onNavigate('login')}>Access Account</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/hero.png" alt="PrimeSmsHub" className="footer-logo" />
              <h3>PrimeSmsHub</h3>
              <p>The premier destination for secure virtual connectivity and instant SMS verification.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="onClick={(e) => { e.preventDefault(); handleNavigate('pricing'); }}">Pricing</a>
                <a className="b" onClick={() => onNavigate('login')}>Buy Numbers</a>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#contact">Contact</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="mailto:support@primesmshub.com">Email Support</a>
                <a href="#" target="_blank">Telegram Bot</a>
                <a href="#">Help Center</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 PrimeSmsHub. All rights reserved.</p>
            <div className="socials">
              <a href="#">TW</a>
              <a href="#">IG</a>
              <a href="#">TG</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
