// src/pages/Login.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { auth, db } from "../firebasejs/config";
import { doc, updateDoc, serverTimestamp, addDoc, collection, getDoc } from "firebase/firestore";
import AuthModeSwitch from "../components/AuthModeSwitch";
import "./Login.css";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setResetMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      return setError("Please enter email and password.");
    }

    setLoading(true);

    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;
      console.log("Login attempted:", user.uid);

      // Check if email is verified
      if (!user.emailVerified) {
        setError(
          <div className="verification-error">
            <p>Please verify your email address before logging in.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                className="resend-link-button" 
                onClick={() => {
                  setError(""); // clear error context so component isn't blocked
                  if (onNavigate) onNavigate('verify-email');
                }}
                disabled={loading}
              >
                Go to Verification
              </button>
              <button 
                className="resend-link-button" 
                onClick={() => handleResendVerification(user)}
                disabled={loading}
                style={{ background: 'rgba(74, 144, 226, 0.1)', color: '#4A90E2' }}
              >
                Resend Email
              </button>
            </div>
          </div>
        );
        setLoading(false);
        return;
      }

      console.log("Login successful:", user.uid);

      // Update last login in Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // 1. Fetch user data first to check status
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        
        // 2. Check if user is banned (case-insensitive)
        const status = (userData.status || '').toLowerCase().trim();
        if (status === 'banned') {
          console.warn("🚫 Login blocked: User is banned");
          await signOut(auth);
          setError("Your account has been suspended. Please contact support.");
          setLoading(false);
          return;
        }

        // 3. Update document (knowing they are not banned)
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          emailVerified: true // Sync with Auth
        });

        const userName = userData.name || userData.fullName || user.email;

        // 4. Notify Admin
        await addDoc(collection(db, 'notifications'), {
          recipient: 'admin',
          title: 'User Login',
          message: `User ${userName} just logged in.`,
          timestamp: serverTimestamp(),
          read: false
        });
      } catch (firestoreError) {
        console.warn("Firestore error during login check:", firestoreError);
        // If it's a permission error, they are likely still banned by Rules
        if (firestoreError.code === 'permission-denied') {
          await signOut(auth);
          setError("Access denied. Your account status may be restricted.");
          setLoading(false);
          return;
        }
      }

      // Redirect to dashboard
      if (onNavigate) {
        onNavigate("dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);

      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Check your internet.");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      return setError("Enter your email above first to reset password.");
    }
    
    setLoading(true);
    setError("");
    setResetMessage("");
    
    try {
      const actionCodeSettings = {
        url: 'https://ng.primesmshub.space/login',
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      setResetMessage("Password reset email sent! Please check your inbox (and spam folder).");
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else {
        setError("Could not send reset email. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (user) => {
    try {
      setLoading(true);
      const actionCodeSettings = {
        url: 'https://ng.primesmshub.space/dashboard',
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      setResetMessage("Verification link sent! Please check your email to verify.");
      setError("");
      if (onNavigate) onNavigate('verify-email');
    } catch (err) {
      console.error("Resend error:", err);
      setError("Could not send verification email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Helmet>
        <title>Login - PrimeSmsHub | Secure Access</title>
        <meta name="description" content="Login to your PrimeSmsHub account and manage your SMS verifications, virtual numbers, and wallet balances." />
        <meta property="og:title" content="Login - PrimeSmsHub | Secure Access" />
        <meta property="og:description" content="Secure login to your PrimeSmsHub account for managing SMS verifications and virtual numbers." />
        <meta property="og:url" content="https://primesmshub.space/login" />
        <meta name="canonical" content="https://primesmshub.space/login" />
        <link rel="alternate" hreflang="en" href="https://primesmshub.space/login" />
        <link rel="alternate" hreflang="en-NG" href="https://ng.primesmshub.space/login" />
        <link rel="alternate" hreflang="x-default" href="https://primesmshub.space/login" />
      </Helmet>

      <div className="bg-decorations">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      <div className="login-container">
        <div className="login-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            className="dashboard-back-button borderless" 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginBottom: '12px', alignSelf: 'flex-start' }}
            onClick={() => onNavigate && onNavigate('home')}
          >
            ← Back to Home
          </button>
          <AuthModeSwitch activeMode="login" onNavigate={onNavigate} />
          <div className="login-header">
            <h1>Welcome Back 👋</h1>
            <p>Login to your PrimeSmsHub account</p>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {resetMessage && (
            <div className="success-message">
              <span>✅</span> {resetMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div
              className="forgot-password"
              onClick={handlePasswordReset}
            >
              Forgot Password?
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?
              <span
                onClick={() => onNavigate && onNavigate('signup')}
                className="link"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}