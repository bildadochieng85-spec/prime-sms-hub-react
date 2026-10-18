import React from 'react';
import './AuthModeSwitch.css';

export default function AuthModeSwitch({ activeMode, onNavigate }) {
  return (
    <div className="auth-mode-switch" role="tablist" aria-label="Account access">
      <button
        id="auth-login-tab"
        className={activeMode === 'login' ? 'active' : ''}
        type="button"
        role="tab"
        aria-selected={activeMode === 'login'}
        aria-controls="auth-form"
        onClick={() => onNavigate('login')}
      >
        Log in
      </button>
      <button
        id="auth-signup-tab"
        className={activeMode === 'signup' ? 'active' : ''}
        type="button"
        role="tab"
        aria-selected={activeMode === 'signup'}
        aria-controls="auth-form"
        onClick={() => onNavigate('signup')}
      >
        Create account
      </button>
    </div>
  );
}
