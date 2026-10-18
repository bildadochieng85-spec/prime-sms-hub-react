// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebasejs/config';
import { sendEmailVerification, signOut } from 'firebase/auth';
import './VerifyEmail.css';

export default function VerifyEmail({ onNavigate, user }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResendEmail = async () => {
    if (!user) return;
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
    if (!auth.currentUser) return;
    
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Refresh user state
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setMessage('Email verified! Redirecting...');
        setTimeout(() => {
          window.location.reload(); // App.jsx will route to dashboard automatically
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

  // Auto-check once on mount
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.currentUser) {
        auth.currentUser.reload().then(() => {
          if (auth.currentUser.emailVerified) {
            clearInterval(interval);
            window.location.reload();
          }
        });
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="verify-email-wrapper">
      <div className="bg-decorations">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verify-icon-wrapper">
            <span>📧</span>
          </div>
          <h2>Verify Your Email</h2>
          <p>
            We've sent a verification link to:
            <span className="user-email">{user?.email}</span>
          </p>
          <p className="instruction-text">
            Please click the link in the email to activate your account. 
            Once clicked, your dashboard will automatically open.
          </p>

          <div className="verify-actions" style={{ flexDirection: 'column', marginTop: '20px' }}>
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
              Resend Verification Email
            </button>
          </div>

          <div className="verify-actions" style={{ marginTop: '10px' }}>
            <button 
              className="btn-logout" 
              onClick={handleLogout}
            >
              Logout and use another account
            </button>
          </div>

          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
