import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import './Home.css';

const features = [
  {
    icon: 'shield',
    title: 'Privacy by design',
    description:
      'Keep your personal number private with virtual numbers made for online verification.',
  },
  {
    icon: 'globe',
    title: 'Numbers around the world',
    description:
      'Choose from a broad range of countries and popular services, all in one place.',
  },
  {
    icon: 'bolt',
    title: 'Codes without the wait',
    description:
      'Get your verification messages as soon as they arrive, right in your account.',
  },
  {
    icon: 'tag',
    title: 'Clear, upfront pricing',
    description:
      'See the price before you start. No hidden fees or surprise charges.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Choose a service',
    description: 'Pick the app you want to verify and browse available numbers.',
  },
  {
    number: '02',
    title: 'Get your number',
    description: 'Select a country and use your temporary number to sign up.',
  },
  {
    number: '03',
    title: 'Receive your code',
    description: 'Your SMS appears in your inbox as soon as it is delivered.',
  },
];

function FeatureIcon({ name }) {
  const paths = {
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    tag: (
      <>
        <path d="M20 13 13 20 4 11V4h7l9 9Z" />
        <circle cx="8.5" cy="8.5" r="1" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="home-feature-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default function Home({ onNavigate, theme, setTheme }) {
  const handleGetStarted = () => {
    onNavigate('signup');
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>PrimeSmsHub - Private SMS Verification, Made Simple</title>
        <meta
          name="description"
          content="Get a virtual number for fast, private SMS verification. Choose from numbers around the world and receive your codes online with PrimeSmsHub."
        />
        <link rel="canonical" href="https://primesmshub.space/" />
        <link rel="alternate" hrefLang="en" href="https://primesmshub.space/" />
        <link rel="alternate" hrefLang="en-NG" href="https://ng.primesmshub.space/" />
        <link rel="alternate" hrefLang="x-default" href="https://primesmshub.space/" />
      </Helmet>

      <Navbar onNavigate={onNavigate} theme={theme} setTheme={setTheme} />

      <main>
        <section className="home-hero">
          <div className="home-shell home-hero-grid">
            <div className="home-hero-copy">
              <div className="home-eyebrow">
                <span className="home-status-dot" />
                A simpler way to verify
              </div>
              <h1>
                Your number stays yours.
                <span> Your code is on its way.</span>
              </h1>
              <p className="home-hero-description">
                Verify online accounts with a virtual number, not your personal one.
                Private, straightforward, and ready when you are.
              </p>
              <div className="home-hero-actions">
                <button className="home-button home-button-primary" onClick={handleGetStarted}>
                  Get started for free
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  className="home-button home-button-quiet"
                  onClick={() => onNavigate('pricing')}
                >
                  Explore pricing
                </button>
              </div>
              <div className="home-hero-note">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M10 2.5 16 5v4.3c0 3.6-2.5 6.4-6 8.2-3.5-1.8-6-4.6-6-8.2V5l6-2.5Z" />
                  <path d="m7.5 9.8 1.7 1.7 3.5-3.7" />
                </svg>
                Your personal number stays private
              </div>
            </div>

            <div className="home-inbox-wrap" aria-label="Preview of an SMS inbox">
              <div className="home-inbox-decoration home-inbox-decoration-one" />
              <div className="home-inbox-decoration home-inbox-decoration-two" />
              <div className="home-inbox-card">
                <div className="home-inbox-header">
                  <div>
                    <span className="home-inbox-label">YOUR INBOX</span>
                    <h2>Verification messages</h2>
                  </div>
                  <span className="home-inbox-live">
                    <span /> Live
                  </span>
                </div>
                <div className="home-inbox-number">
                  <span className="home-phone-icon" aria-hidden="true">
                    +
                  </span>
                  <span>
                    <small>Your active number</small>
                    <strong>+1 (202) 555-0146</strong>
                  </span>
                  <span className="home-number-status">Active</span>
                </div>
                <div className="home-message-card">
                  <div className="home-message-top">
                    <span className="home-service-icon" aria-hidden="true">
                      W
                    </span>
                    <span className="home-message-service">
                      <strong>WhatsApp</strong>
                      <small>Verification code</small>
                    </span>
                    <span className="home-message-time">now</span>
                  </div>
                  <p>Your verification code is</p>
                  <div className="home-verification-code" aria-label="Example code 482193">
                    <span>4</span>
                    <span>8</span>
                    <span>2</span>
                    <i />
                    <span>1</span>
                    <span>9</span>
                    <span>3</span>
                  </div>
                  <div className="home-message-received">
                    <span /> Message received securely
                  </div>
                </div>
                <div className="home-inbox-footer">
                  <span className="home-inbox-footer-icon" aria-hidden="true">✓</span>
                  Your code, right where you need it.
                </div>
              </div>
              <div className="home-floating-note">
                <span className="home-floating-check" aria-hidden="true">✓</span>
                <span>
                  <strong>Private by default</strong>
                  <small>No personal number needed</small>
                </span>
              </div>
            </div>
          </div>
          <a className="home-scroll-cue" href="#features">
            <span /> Discover PrimeSmsHub
          </a>
        </section>

        <section id="features" className="home-features home-section">
          <div className="home-shell">
            <div className="home-section-heading">
              <span className="home-section-kicker">MADE FOR PEACE OF MIND</span>
              <h2>Verification, without the hassle.</h2>
              <p>
                Everything you need to protect your number and get on with what matters.
              </p>
            </div>
            <div className="home-feature-grid">
              {features.map((feature) => (
                <article className="home-feature-card" key={feature.title}>
                  <div className={`home-feature-icon-wrap home-icon-${feature.icon}`}>
                    <FeatureIcon name={feature.icon} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-how-it-works home-section">
          <div className="home-shell home-process-layout">
            <div className="home-process-heading">
              <span className="home-section-kicker">THREE SIMPLE STEPS</span>
              <h2>From signup to SMS in moments.</h2>
              <p>
                No complicated setup. Choose a number, use it for verification, and find
                your code in your inbox.
              </p>
              <button className="home-text-link" onClick={handleGetStarted}>
                Create your account <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="home-steps">
              {steps.map((step) => (
                <article className="home-step" key={step.number}>
                  <span className="home-step-number">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-stats-section">
          <div className="home-shell">
            <div className="home-stats-panel">
              <div className="home-stats-intro">
                <span className="home-section-kicker">BUILT TO CONNECT</span>
                <h2>More reach.<br />Less friction.</h2>
              </div>
              <div className="home-stat">
                <strong>500<span>+</span></strong>
                <span>countries supported</span>
              </div>
              <div className="home-stat">
                <strong>1<span>M+</span></strong>
                <span>SMS messages delivered</span>
              </div>
              <div className="home-stat">
                <strong>99.9<span>%</span></strong>
                <span>service uptime</span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="home-cta-section">
          <div className="home-shell">
            <div className="home-cta-card">
              <div className="home-cta-mark" aria-hidden="true">
                <span>+</span>
              </div>
              <div className="home-cta-copy">
                <span className="home-section-kicker">YOUR NEXT STEP</span>
                <h2>Keep your number to yourself.</h2>
                <p>Get started with a more private way to verify online.</p>
              </div>
              <div className="home-cta-actions">
                <button className="home-button home-button-primary" onClick={handleGetStarted}>
                  Create your free account <span aria-hidden="true">→</span>
                </button>
                <button
                  className="home-cta-login"
                  onClick={() => onNavigate('login')}
                >
                  Already a member? <strong>Log in</strong>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="home-footer">
        <div className="home-shell">
          <div className="home-footer-main">
            <div className="home-footer-brand">
              <a href="/" onClick={(event) => { event.preventDefault(); onNavigate('home'); }}>
                <img src="/hero.png" alt="" />
                <strong>PrimeSmsHub</strong>
              </a>
              <p>A more private way to stay connected online.</p>
            </div>
            <div className="home-footer-links">
              <div>
                <h3>Explore</h3>
                <a href="#features">Features</a>
                <button onClick={() => onNavigate('pricing')}>Pricing</button>
                <button onClick={() => onNavigate('login')}>Buy numbers</button>
              </div>
              <div>
                <h3>Company</h3>
                <a href="#about">About us</a>
                <button onClick={() => onNavigate('privacy')}>Privacy policy</button>
                <a href="mailto:support@primesmshub.com">Contact support</a>
              </div>
            </div>
          </div>
          <div className="home-footer-bottom">
            <span>© 2026 PrimeSmsHub. All rights reserved.</span>
            <span>Private by design. Simple by nature.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}