import { useState, useEffect, useRef } from 'react';
import { pollForSMS, cancelOrder, banNumber } from '../services/smsPolling';
import './SMSDisplay.css';

/**
 * SMSDisplay Component - Redesigned to match 5SIM style
 */
export const SMSDisplay = ({ 
  orderId: initialOrderId, 
  authToken, 
  onComplete, 
  autoStart = true,
  product,
  phoneNumber,
  country,
  operator,
  price,
  isAdmin = false
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [state, setState] = useState('loading'); // loading, received, timeout, error, canceled
  const [smsData, setSmsData] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [isActionLoading, setIsActionLoading] = useState(false);
  const pollingRef = useRef(false);

  // Sync internal orderId state with prop
  useEffect(() => {
    setOrderId(initialOrderId);
  }, [initialOrderId]);

  // Timer logic
  useEffect(() => {
    if (state === 'loading' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && state === 'loading') {
      setState('timeout');
    }
  }, [state, timeLeft]);

  // Auto-start polling if orderId provided
  useEffect(() => {
    if (autoStart && orderId && authToken && !pollingRef.current) {
      startPolling();
    }
  }, [orderId, authToken, autoStart]);

  const startPolling = async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    
    setState('loading');
    setError(null);
    setSmsData(null);

    try {
      const result = await pollForSMS(orderId, authToken, isAdmin);
      pollingRef.current = false;

      if (result.success) {
        setSmsData(result);
        setState('received');
        onComplete?.(result);
      } else {
        setError(result.error);
        if (result.status === 'CANCELED') setState('canceled');
        else if (result.status === 'TIMEOUT') setState('timeout');
        else setState('error');
      }
    } catch (err) {
      pollingRef.current = false;
      setError(err.message);
      setState('error');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsActionLoading(true);
    const result = await cancelOrder(orderId);
    if (result && !result.error) {
      setState('canceled');
    } else {
      alert('Failed to cancel: ' + (result?.error || 'Unknown error'));
    }
    setIsActionLoading(false);
  };

  const handleBan = async () => {
    if (!window.confirm('Ban this number? Use this if you are not receiving the OTP.')) return;
    setIsActionLoading(true);
    const result = await banNumber(orderId);
    if (result && !result.error) {
      setState('canceled'); // Treated as canceled/finished in UI
    } else {
      alert('Failed to ban: ' + (result?.error || 'Unknown error'));
    }
    setIsActionLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple alert-less copy feedback could be added here
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minutes left`;
  };

  const getStatusText = () => {
    switch (state) {
      case 'received': return 'Received';
      case 'timeout': return 'Timeout';
      case 'canceled': return 'Canceled';
      case 'error': return 'Error';
      default: return 'Waiting for SMS';
    }
  };

  if (!orderId || !authToken) {
    return <div className="sms-card error-card">⚠️ Missing orderId or authToken</div>;
  }

  return (
    <div className={`sms-container ${state}`}>
      <div className="sms-card-premium dark-integration">

        {/* Number Box */}
        <div className="sms-field-container">
          <label className="field-label">Number</label>
          <div className="number-input-group">
            <button className="icon-btn side-btn" onClick={() => copyToClipboard(phoneNumber)} title="Copy with + country code">
              <span className="plus-sign">+</span>
              📋
            </button>
            <div className="number-display">{phoneNumber}</div>
            <button className="icon-btn side-btn" onClick={() => copyToClipboard(phoneNumber)} title="Copy number only">📋</button>
          </div>
        </div>

        {/* Tip Box */}
        <div className="sms-tip-box">
          <p className="tip-title">Can't receive OTP?</p>
          <p className="tip-text">Try requesting the SMS message for the service you need again.</p>
          <div className="tip-pagination">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* SMS Code Box */}
        <div className="sms-field-container">
          <div className="label-with-help">
            <label className="field-label">Code from SMS</label>
            <span className="help-icon">?</span>
          </div>
          <div className="code-input-group">
             <div className={`code-display-box ${state === 'received' ? 'active' : ''}`}>
               {state === 'received' ? smsData.code : ''}
             </div>
             <button className="icon-btn" onClick={() => smsData && copyToClipboard(smsData.code)}>📋</button>
          </div>
        </div>

        {/* Status and Timer */}
        <div className="sms-status-section">
           <div className="status-row">
             <span className="info-label">Status</span>
             <span className={`status-badge ${state}`}>
               {state === 'loading' ? '⌛ ' : state === 'received' ? '✅ ' : '❌ '}
               {getStatusText()}
             </span>
           </div>

           <div className="timer-container">
             <span className="timer-text">{state === 'loading' ? formatTime(timeLeft) : ''}</span>
             <div className="progress-bar-bg">
               <div 
                 className="progress-bar-fill" 
                 style={{ width: `${(timeLeft / 900) * 100}%` }}
               ></div>
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="sms-actions-premium">
          <button 
            className="btn-ban" 
            onClick={handleBan}
            disabled={isActionLoading || state !== 'loading'}
          >
            Ban
          </button>
          <button 
            className="btn-cancel-premium" 
            onClick={handleCancel}
            disabled={isActionLoading || state !== 'loading'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * SimpleSMSDisplay Component - Minimal version
 */
export const SimpleSMSDisplay = ({ orderId, authToken, onCodeReceived }) => {
  const [code, setCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderId && authToken && !code) {
      const poll = async () => {
        setIsLoading(true);
        const result = await pollForSMS(orderId, authToken);
        setIsLoading(false);

        if (result.success) {
          setCode(result.code);
          onCodeReceived?.(result.code);
        }
      };
      poll();
    }
  }, [orderId, authToken, code, onCodeReceived]);

  if (!code) {
    return (
      <div className="simple-sms-minimal">
        {isLoading ? <div className="mini-spinner"></div> : 'Waiting...'}
      </div>
    );
  }

  return (
    <div className="simple-sms-minimal received">
      <code>{code}</code>
    </div>
  );
};

export default SMSDisplay;

