import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import './Home.css';

const features = [
  {
    label: 'YOUR PRIVACY',
    icon: 'shield',
    title: 'Privacy by design',
    description:
      'Keep your personal number private with virtual numbers made for online verification.',
  },
  {
    label: 'GLOBAL ACCESS',
    icon: 'globe',
    title: 'Numbers around the world',
    description:
      'Choose from a broad range of countries and popular services, all in one place.',
  },
  {
    label: 'RIGHT ON TIME',
    icon: 'bolt',
    title: 'Codes without the wait',
    description:
      'Get your verification messages as soon as they arrive, right in your account.',
  },
  {
    label: 'NO SURPRISES',
    icon: 'tag',
    title: 'Clear, upfront pricing',
    description:
      'See the price before you start. No hidden fees or surprise charges.',
  },
];

const reassurancePoints = [
  'No personal number needed',
  'Your codes in one inbox',
  'Know the price upfront',
];

const steps = [
  {
    number: '01',
    icon: 'search',
    eyebrow: 'PICK YOUR SERVICE',
    title: 'Choose a service',
    description: 'Select the app you want to verify, then browse available countries.',
  },
  {
    number: '02',
    icon: 'phone',
    eyebrow: 'GET A PRIVATE NUMBER',
    title: 'Choose your number',
    description: 'Pick an available virtual number and use it for your verification.',
  },
  {
    number: '03',
    icon: 'message',
    eyebrow: 'CHECK YOUR INBOX',
    title: 'Receive your code',
    description: 'When the SMS arrives, find your verification code in your inbox.',
  },
];

function StepIcon({ name }) {
  const paths = {
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4 4M8 10.8h5.6M10.8 8v5.6" />
      </>
    ),
    phone: (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
        <path d="M10 5.5h4M11 18.5h2" />
      </>
    ),
    message: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.7-3.2A7.5 7.5 0 1 1 20 11.5Z" />
        <path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
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
            <div className="home-features-heading-row">
              <div className="home-section-heading">
                <span className="home-section-kicker">MADE FOR PEACE OF MIND</span>
                <h2>Verification, without the hassle.</h2>
                <p>
                  A calmer way to sign up online: keep your personal number private,
                  find a number that works for you, and get your code in one place.
                </p>
              </div>
              <div className="home-features-note">
                <span className="home-features-note-icon" aria-hidden="true">
                  <FeatureIcon name="shield" />
                </span>
                <span>
                  <strong>Your number stays yours</strong>
                  <small>Use a virtual number for verification.</small>
                </span>
              </div>
            </div>
            <div className="home-feature-grid">
              {features.map((feature, index) => (
                <article className="home-feature-card" key={feature.title}>
                  <div className="home-feature-card-top">
                    <span>{feature.label}</span>
                    <div className={`home-feature-icon-wrap home-icon-${feature.icon}`}>
                      <FeatureIcon name={feature.icon} />
                    </div>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="home-feature-card-index">0{index + 1}</span>
                </article>
              ))}
            </div>
            <div className="home-reassurance-bar" aria-label="PrimeSmsHub benefits">
              <span className="home-reassurance-label">THE ESSENTIALS</span>
              {reassurancePoints.map((point) => (
                <span className="home-reassurance-point" key={point}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 10 3.2 3.2L15 6.5" />
                  </svg>
                  {point}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="home-how-it-works home-section">
          <div className="home-shell home-process-layout">
            <div className="home-process-heading">
              <div className="home-process-copy">
                <span className="home-section-kicker">HOW IT WORKS</span>
                <h2>Three simple steps to your code.</h2>
                <p>
                  No complicated setup. Choose a service, get a private number, and
                  check your inbox for the verification code.
                </p>
              </div>
              <div className="home-process-actions">
                <button
                  className="home-button home-button-primary home-process-button"
                  onClick={handleGetStarted}
                >
                  Get started for free <span aria-hidden="true">→</span>
                </button>
                <div className="home-process-assurance">
                <span aria-hidden="true">✓</span>
                No app download required
                </div>
              </div>
            </div>
            <div className="home-steps">
              {steps.map((step) => (
                <article className="home-step" key={step.number}>
                  <div className="home-step-top">
                    <span className="home-step-icon">
                      <StepIcon name={step.icon} />
                    </span>
                    <span className="home-step-number">{step.number}</span>
                  </div>
                  <div className="home-step-content">
                    <span className="home-step-eyebrow">{step.eyebrow}</span>
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
            <div className="home-stats-panel" role="group" aria-label="PrimeSmsHub service highlights">
              <div className="home-stats-intro">
                <span className="home-section-kicker">BUILT TO CONNECT</span>
                <h2>Global reach.<br />A smoother way to verify.</h2>
                <p>One simple place to find a number and receive your verification code.</p>
              </div>
              <div className="home-stat">
                <strong>500<span>+</span></strong>
                <span>countries<br />supported</span>
              </div>
              <div className="home-stat">
                <strong>1<span>M+</span></strong>
                <span>SMS messages<br />delivered</span>
              </div>
              <div className="home-stat">
                <strong>99.9<span>%</span></strong>
                <span>service<br />uptime</span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="home-cta-section">
          <div className="home-shell">
            <div className="home-cta-card">
              <div className="home-cta-mark" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
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
              <span className="home-footer-brand-note">
                <span aria-hidden="true" />
                Private by design. Simple by nature.
              </span>
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
            <a href="mailto:support@primesmshub.com">Need help? Contact support <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}