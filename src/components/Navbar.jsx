import React, { useState, useEffect } from 'react';
import { auth } from '../firebasejs/config';
import { signOut } from 'firebase/auth';
import './Navbar.css';

export default function Navbar({ onNavigate, user = null, theme, setTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (page) => {
    onNavigate?.(page);
    setIsMenuOpen(false);
  };

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    handleNavigate('home');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`site-header${isScrolled ? ' scrolled' : ''}`}>
      <div className="navbar-container">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            handleNavigate('home');
          }}
        >
          <strong>PrimeSmsHub</strong>
          <span>Secure Verification</span>
        </a>

        <button
          className={`hamburger${isMenuOpen ? ' active' : ''}`}
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`nav-menu${isMenuOpen ? ' open' : ''}`}
          id="primary-navigation"
          aria-label="Main navigation"
        >
          <div className="nav-links">
            <a href="#features" onClick={(event) => scrollToSection(event, 'features')}>
              Features
            </a>
            <a
              href="/pricing"
              onClick={(event) => {
                event.preventDefault();
                handleNavigate('pricing');
              }}
            >
              Pricing
            </a>
            <a href="#about" onClick={(event) => scrollToSection(event, 'about')}>
              About
            </a>
            <a href="#contact" onClick={(event) => scrollToSection(event, 'contact')}>
              Contact
            </a>
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <svg
                aria-hidden="true"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            </button>

            {user ? (
              <>
                <button
                  className="nav-action-button nav-dashboard"
                  type="button"
                  onClick={() => handleNavigate('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className="nav-action-button nav-login"
                  type="button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  className="nav-action-button nav-login"
                  type="button"
                  onClick={() => handleNavigate('login')}
                >
                  <svg
                    aria-hidden="true"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                  Login / Buy
                </button>
                <button
                  className="nav-action-button nav-signup"
                  type="button"
                  onClick={() => handleNavigate('signup')}
                >
                  Sign up
                  <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
