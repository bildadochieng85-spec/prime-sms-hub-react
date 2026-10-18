// App.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebasejs/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import './App.css';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Pricing from './pages/Pricing';
import AIAssistant from './components/AIAssistant';

function App() {
  const getInitialPage = () => {
    const path = window.location.pathname.substring(1);
    const validPages = ['home', 'login', 'signup', 'dashboard', 'verify-email', 'terms', 'privacy', 'pricing'];
    return validPages.includes(path) ? path : 'home';
  };
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Global Maintenance Listener
  useEffect(() => {
    const settingsRef = doc(db, 'adminSettings', 'global');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceMode(!!data.maintenanceMode);
        setMaintenanceMessage(data.maintenanceMessage || 'System is currently undergoing maintenance. Please try again later.');
      }
    }, (error) => {
      console.error("Maintenance listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Always redirect to home on page load, regardless of login status
      if (currentPage !== 'home' && getInitialPage() === 'home') {
        setCurrentPage('home');
      }

      // If user is not logged in and on protected routes, redirect to home
      if (!currentUser && ['dashboard', 'verify-email'].includes(currentPage)) {
        setCurrentPage('home');
      }

      // If logged in but NOT verified and trying to access dashboard, redirect to verify-email
      if (currentUser && !currentUser.emailVerified && currentPage === 'dashboard') {
        setCurrentPage('verify-email');
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync URL with currentPage without full reload
  useEffect(() => {
    const path = currentPage === 'home' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentPage]);

  const handleNavigate = (page) => {
    console.log('Navigating to:', page);

    // Require login before accessing dashboard
    if (page === 'dashboard' && !user) {
      setCurrentPage('login');
      return;
    }

    // Protect verify-email route
    if (page === 'verify-email' && !user) {
      setCurrentPage('login');
      return;
    }

    setCurrentPage(page);
  };

  const renderPage = () => {
    console.log('Rendering page:', currentPage, 'User:', user?.email, 'Verified:', user?.emailVerified);

    switch (currentPage) {
      case 'login':
      case 'signup':
        return <AuthPage initialMode={currentPage} onNavigate={handleNavigate} />;
      case 'verify-email':
        return <VerifyEmail onNavigate={handleNavigate} user={user} theme={theme} setTheme={setTheme} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} user={user} theme={theme} setTheme={setTheme} />;
      case 'terms':
        return <Terms onNavigate={handleNavigate} theme={theme} setTheme={setTheme} />;
      case 'privacy':
        return <Privacy onNavigate={handleNavigate} theme={theme} setTheme={setTheme} />;
      case 'pricing':
        return <Pricing onNavigate={handleNavigate} theme={theme} setTheme={setTheme} />;
      case 'home':
      default:
        return <Home onNavigate={handleNavigate} theme={theme} setTheme={setTheme} />;
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading PrimeSmsHub...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {maintenanceMode ? (
        <div className="maintenance-overlay">
          <div className="maintenance-content">
            <span className="maintenance-icon">🛠️</span>
            <h1>System Maintenance</h1>
            <p>{maintenanceMessage}</p>
            <div className="maintenance-footer">
              <span>We'll be back shortly. Thank you for your patience.</span>
            </div>
            {user && (
              <button 
                className="secondary-btn" 
                style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => signOut(auth)}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {renderPage()}
          <AIAssistant />
        </>
      )}
    </div>
  );
}

export default App;