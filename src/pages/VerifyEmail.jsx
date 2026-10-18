// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebasejs/config';
import { sendEmailVerification, signOut } from 'firebase/auth';
import '../styles/AuthTheme.css';
import './VerifyEmail.css';

export default function VerifyEmail({ onNavigate, user }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setError('Your session has expired. Please log in again to continue.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const actionCodeSettings = {
        url: 'https://primesmshub.space/dashboard',
        handleCodeInApp: false,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      setMessage('Verification link sent! Please check your inbox.');
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError(err.message || 'Failed to send verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) {
      setError('Your session has expired. Please log in again to continue.');
      return;
    }
    
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Refresh user state
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setMessage('Email verified! Redirecting...');
        setTimeout(() => {
          window.location.assign('/dashboard');
        }, 1500);
      } else {
        setError('Email not verified yet. Please click the link in your email.');
      }
    } catch (err) {
      console.error('Error checking verification:', err);
      setError(err.message || 'Could not verify status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onNavigate) onNavigate('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    if (!user || user.emailVerified) return undefined;

    let isMounted = true;
    const checkVerification = async () => {
      try {
        await auth.currentUser?.reload();
        if (isMounted && auth.currentUser?.emailVerified) {
          window.location.assign('/dashboard');
        }
      } catch (err) {
        console.error('Automatic verification check failed:', err);
      }
    };

    const interval = setInterval(checkVerification, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  return (
    <div className="verify-email-wrapper">
      <div className="bg-decorations">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verify-icon-wrapper">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <rect x="7" y="11" width="34" height="26" rx="6" />
              <path d="m9 15 15 12 15-12" />
              <path d="m9 34 11-10M39 34 28 24" />
            </svg>
          </div>
          <h2>Verify Your Email</h2>
          <p className="verify-intro">One quick step left before you can use your account.</p>

          <div className="verify-email-address">
            <span>Verification link sent to</span>
            <strong className="user-email">{user?.email || 'your email address'}</strong>
          </div>

          <p className="instruction-text">
            Open the email and select its verification link. We’ll take you to your dashboard
            once your email is confirmed. If you don’t see it, check your spam folder.
          </p>

          <div className="verify-actions verify-main-actions">
            <button 
              type="button"
              className="btn-primary" 
              onClick={handleCheckVerification}
              disabled={loading}
            >
              {loading ? 'Checking...' : "I've Clicked the Link"}
            </button>
            <button 
              type="button"
              className="btn-secondary" 
              onClick={handleResendEmail}
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Resend verification email'}
            </button>
          </div>

          <div className="verify-actions verify-account-actions">
            <button 
              className="btn-logout" 
              onClick={handleLogout}
              disabled={loading}
            >
              Log out and use another account
            </button>
          </div>

          {message && <div className="message success" role="status" aria-live="polite">{message}</div>}
          {error && <div className="message error" role="alert">{error}</div>}
        </div>
      </div>
    </div>
  );
}
