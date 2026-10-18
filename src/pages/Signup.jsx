// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { auth, db } from '../firebasejs/config';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import AuthModeSwitch from '../components/AuthModeSwitch';
import './Signup.css';

export default function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    // Validation
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.fullName
      });

      // Send Firebase email verification link with custom redirect URL
      const actionCodeSettings = {
        url: 'https://ng.primesmshub.space/dashboard',
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || '',
        wallet: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailVerified: false, // Initially false
        role: 'user', // Default role for standard users
        uid: user.uid
      });

      setVerificationSent(true);
    } catch (err) {
      console.error('Signup error:', err);

      switch (err.code) {
        case 'auth/email-already-in-use':
          setFieldErrors({ email: 'Email already in use. Please login instead.' });
          break;
        case 'auth/invalid-email':
          setFieldErrors({ email: 'Invalid email address' });
          break;
        case 'auth/weak-password':
          setFieldErrors({ password: 'Password is too weak' });
          break;
        default:
          setFieldErrors({ form: err.message || 'Signup failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <Helmet>
        <title>Sign Up - PrimeSmsHub | Create Your Account</title>
        <meta name="description" content="Create your PrimeSmsHub account and start receiving SMS verifications instantly. Sign up now for secure virtual numbers worldwide." />
        <meta property="og:title" content="Sign Up - PrimeSmsHub | Create Your Account" />
        <meta property="og:description" content="Create your PrimeSmsHub account and start receiving SMS verifications instantly." />
        <meta property="og:url" content="https://primesmshub.space/signup" />
        <meta name="canonical" content="https://primesmshub.space/signup" />
        <link rel="alternate" hreflang="en" href="https://primesmshub.space/signup" />
        <link rel="alternate" hreflang="en-NG" href="https://ng.primesmshub.space/signup" />
        <link rel="alternate" hreflang="x-default" href="https://primesmshub.space/signup" />
      </Helmet>

      <div className="bg-decorations">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      <div className="signup-container">
        <div className="signup-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            className="dashboard-back-button borderless" 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginBottom: '12px', alignSelf: 'flex-start' }} 
            onClick={() => onNavigate && onNavigate('home')}
          >
            ← Back to Home
          </button>
          <AuthModeSwitch activeMode="signup" onNavigate={onNavigate} />
          {verificationSent ? (
            <div className="verification-success">
              <div className="success-icon">📧</div>
              <h2>Verify Your Email</h2>
              <p>We've sent a verification link to <strong>{formData.email}</strong>.</p>
              <p>Please check your inbox and click the link to activate your account.</p>
              <button
                className="login-button"
                onClick={() => onNavigate && onNavigate('verify-email')}
              >
                I've Verified My Email
              </button>
              <p className="resend-text">Didn't get the email? Check your spam folder or try logging in to resend.</p>
            </div>
          ) : (
            <>
              <div className="signup-header">
                <h2>Create Account</h2>
                <p>Join PrimeSmsHub today</p>
              </div>

              {fieldErrors.form && (
                <div className="error-message">
                  <span>⚠️</span> {fieldErrors.form}
                </div>
              )}

              <form onSubmit={handleSignup} className="signup-form">
                <div className="signup-form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className={fieldErrors.fullName ? 'input-error' : ''}
                    />
                    {fieldErrors.fullName && (
                      <span className="field-error">❌ {fieldErrors.fullName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className={fieldErrors.email ? 'input-error' : ''}
                    />
                    {fieldErrors.email && (
                      <span className="field-error">❌ {fieldErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="signup-form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      minLength="6"
                      className={fieldErrors.password ? 'input-error' : ''}
                    />
                    {fieldErrors.password && (
                      <span className="field-error">❌ {fieldErrors.password}</span>
                    )}
                    {!fieldErrors.password && (
                      <small>Must be at least 6 characters</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className={fieldErrors.confirmPassword ? 'input-error' : ''}
                    />
                    {fieldErrors.confirmPassword && (
                      <span className="field-error">❌ {fieldErrors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                <div className="form-checkbox">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-link">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-link">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="signup-button"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="signup-footer">
                <p>Already have an account? <span
                  onClick={() => onNavigate && onNavigate('login')}
                >Login</span></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}