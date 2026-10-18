import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function AuthPage({ initialMode, onNavigate }) {
  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : 'login');

  const handleNavigate = (page) => {
    if (page === 'login' || page === 'signup') {
      setMode(page);
    }
    onNavigate(page);
  };

  return mode === 'signup' ? (
    <Signup onNavigate={handleNavigate} />
  ) : (
    <Login onNavigate={handleNavigate} />
  );
}
