import React, { useState, useEffect, useRef } from 'react';
import { pollForSMS, cancelOrder, banNumber } from '../services/smsPolling';
import { getServiceLogo } from '../utils/serviceLogo';
import './OrderStatusDetail.css';

/**
 * OrderStatusDetail - High-fidelity 5SIM style order status page
 */
const OrderStatusDetail = ({ 
  orderId, 
  authToken, 
  onComplete, 
  service,
  phoneNumber,
  country,
  countryFlag,
  operator,
  price,
  date,
  status: initialStatus = 'active',
  currency = 'USD',
  ngnRate = 1
}) => {
  const [state, setState] = useState(initialStatus === 'active' ? 'loading' : initialStatus.toLowerCase());
  const [smsData, setSmsData] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isActionLoading, setIsActionLoading] = useState(false);
  const pollingRef = useRef(false);

  // Timer logic
  useEffect(() => {
    if (state === 'loading' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && state === 'loading') {
      setState('timeout');
    }
  }, [state, timeLeft]);

  // Start polling if in loading state
  useEffect(() => {
    if (state === 'loading' && orderId && authToken && !pollingRef.current) {
      startPolling();
    }
  }, [orderId, authToken, state]);

  const startPolling = async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    
    try {
      const result = await pollForSMS(orderId, authToken);
      pollingRef.current = false;

      if (result.success) {
        setSmsData(result);
        setState('received');
        onComplete?.(result);
      } else {
        if (result.status === 'CANCELED') setState('canceled');
        else if (result.status === 'TIMEOUT') setState('timeout');
        else {
           setError(result.error);
           setState('error');
        }
      }
    } catch (err) {
      pollingRef.current = false;
      setError(err.message);
      setState('error');
    }
  };

  const handleAction = async (actionFn) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const result = await actionFn(orderId, authToken);
      if (result && !result.error) {
        setState('canceled');
      } else {
        alert('Action failed: ' + (result?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="order-detail-page-container">
      <div className="order-detail-glass-card">
        <header className="order-detail-header">
           <div className="header-top">
             <button className="back-btn-minimal" onClick={() => onComplete?.()} title="Go back to list">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
             </button>
             <div className="header-title-area">
                <span className="order-id-chip">Order #{orderId}</span>
                <h2 className="premium-title">Order Details</h2>
             </div>
             <div className="header-logo-badge">
                {getServiceLogo(service, '32px')}
             </div>
           </div>
        </header>

        <section className="order-main-props">
          <div className="prop-row-premium">
            <div className="prop-group">
              <span className="prop-label-v2">Date</span>
              <span className="prop-value-v2">{date || 'N/A'}</span>
            </div>
            <div className="prop-group text-right">
              <span className="prop-label-v2">Service</span>
              <div className="prop-value-v2 service-flex">
                {getServiceLogo(service, '24px')}
                <span>{service}</span>
              </div>
            </div>
          </div>

          <div className="prop-row-premium">
            <div className="prop-group">
              <span className="prop-label-v2">Country</span>
              <div className="prop-value-v2 country-flex">
                 {countryFlag && <span className="premium-flag">{countryFlag}</span>}
                 <span>{country}</span>
              </div>
            </div>
            <div className="prop-group text-right">
              <span className="prop-label-v2">Price</span>
              <span className="prop-value-v2 price-tag">
                {currency === 'NGN' ? (
                  `₦${(price / ngnRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                ) : (
                  `$${parseFloat(price).toFixed(4)}`
                )}
              </span>
            </div>
          </div>
          
          <div className="prop-row-premium single">
            <div className="prop-group">
              <span className="prop-label-v2">Operator</span>
              <span className="prop-value-v2">{operator || 'Any'}</span>
            </div>
          </div>
        </section>

        <section className="order-detail-interactive">
          <div className="interactive-card number-card">
            <div className="card-label-row">
              <label>Phone Number</label>
              <button className="copy-action-text" onClick={() => copyToClipboard(phoneNumber)}>Copy</button>
            </div>
            <div className="number-display-main">
              <span className="plus-prefix">+</span>
              <span className="main-digits">{phoneNumber}</span>
            </div>
          </div>

          <div className="tip-glass-banner">
            <div className="tip-icon-v2">💡</div>
            <div className="tip-content-v2">
              <strong>Expected an OTP?</strong>
              <p>Requested the SMS message again if it doesn't arrive within 2 minutes.</p>
            </div>
          </div>

          <div className={`interactive-card code-card ${state}`}>
            <label>SMS Code</label>
            <div className="code-display-wrapper">
              <div className="code-status-indicator">
                {state === 'loading' ? (
                  <div className="pulse-loader"></div>
                ) : (
                  <span className={`status-dot ${state}`}></span>
                )}
              </div>
              <div className="code-text-main">
                {state === 'received' ? smsData?.code : (state === 'loading' ? 'Waiting for SMS...' : state.toUpperCase())}
              </div>
              {state === 'received' && (
                <button className="copy-icon-btn-premium" onClick={() => copyToClipboard(smsData?.code)}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="order-time-tracker">
          {state === 'loading' && (
            <div className="time-tracker-wrapper" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)', fontWeight: 600 }}>
                <span>Remaining SMS Lifetime</span>
                <span>{Math.floor(Math.max(0, timeLeft) / 60)}:{(Math.max(0, timeLeft) % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px', background: 'var(--dash-border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="progress-bar-fill" style={{ height: '100%', width: `${Math.max(0, (timeLeft / 900) * 100)}%`, background: 'var(--accent-primary)', transition: 'width 1s linear' }}></div>
              </div>
            </div>
          )}
        </section>

        <footer className="order-detail-footer-premium">
          <div className="status-summary-v2">
            <span className="status-label-v2">Current Status</span>
            <span className={`status-badge-v2 ${state}`}>
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </span>
          </div>
          
          {state === 'loading' && (
            <div className="dual-actions-premium">
              <button className="premium-action-btn secondary" onClick={() => handleAction(banNumber)} disabled={isActionLoading}>
                <span>🚫</span> Ban
              </button>
              <button className="premium-action-btn primary" onClick={() => handleAction(cancelOrder)} disabled={isActionLoading}>
                <span>✕</span> Cancel
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default OrderStatusDetail;
