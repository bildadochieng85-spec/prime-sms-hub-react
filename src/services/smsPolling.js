/**
 * SMS Polling Service
 * Handles polling the backend for incoming SMS from 5SIM
 */

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Extract verification code from SMS text using regex fallback
 * @param {string} text - The raw SMS message text
 * @returns {string|null} - Extracted code or null
 */
const extractCodeFromText = (text) => {
  if (!text) return null;
  // Look for 4-8 digit numbers that are likely verification codes
  // We prioritize matches that follow common keywords
  const patterns = [
    /(?:code|is|verification|pin)\s*(?:is|:)?\s*(\d{4,8})/i,
    /(\d{4,8})/ 
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Poll for SMS arrival on a phone number order
 * @param {string} orderId - The 5SIM order ID
 * @param {string} authToken - Firebase ID token for authentication
 * @returns {Promise<Object>} - { status, code, text, receivedAt, elapsedSeconds }
 * @throws {Error} - If polling fails
 */
export const pollForSMS = async (orderId, authToken) => {
  const MAX_POLLING_TIME = 300000; // 5 minutes in ms
  const startTime = Date.now();
  
  console.log(`🔍 Starting persistent SMS poll for order: ${orderId} (up to 5m)`);

  while (Date.now() - startTime < MAX_POLLING_TIME) {
    try {
      const response = await fetch(
        `${API_BASE}/api/5sim/poll-sms/${orderId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      // Handle SUCCESS
      if (response.ok && data.status === 'RECEIVED' && data.sms && data.sms.length > 0) {
        console.log(`✅ SMS received:`, data);
        const sms = data.sms[0];
        const extractedCode = sms.code || extractCodeFromText(sms.text);
        
        return {
          success: true,
          status: 'RECEIVED',
          code: extractedCode || 'N/A',
          text: sms.text || 'No message content',
          receivedAt: sms.date || new Date().toISOString(),
          elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
        };
      }

      // Handle TIMEOUT (from backend) - Retry
      if (response.status === 408) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`⏳ Backend slice timed out (${elapsed}s elapsed), retrying...`);
        // Small delay to prevent tight loop if backend returns immediately
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      // Handle TERMINAL FAILURES (CANCELED, BANNED, etc.)
      if (['CANCELED', 'BANNED', 'FINISHED'].includes(data.status)) {
        console.warn(`⚠️ Order terminal status reached: ${data.status}`);
        return {
          success: false,
          status: data.status,
          error: data.error || `Order reached terminal state: ${data.status}`,
          elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
        };
      }

      // Handle ACCESS DENIED
      if (response.status === 403) {
        return { success: false, status: 'FORBIDDEN', error: data.error };
      }

      // For other non-critical errors, wait and retry
      console.warn(`⚠️ Polling encountered non-terminal error (${response.status}), retrying in 3s...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`❌ Network or parse error during poll:`, error);
      // Wait a bit before retrying on network error
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.warn(`⏳ SMS polling reached maximum duration (300s)`);
  return {
    success: false,
    status: 'TIMEOUT',
    error: 'SMS was not received within 5 minutes. Try again or request a refund.',
    elapsedSeconds: 300
  };
};

/**
 * Quick check without polling (single request)
 * @param {string} orderId - The 5SIM order ID
 * @param {string} authToken - Firebase ID token
 * @returns {Promise<Object>} - Single check result
 */
export const quickCheckSMS = async (orderId, authToken) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/5sim/check/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const firstSMS = data.sms?.[0];
    const extractedCode = firstSMS?.code || extractCodeFromText(firstSMS?.text);
    const isStatusReceived = data.status === 'RECEIVED';
    
    return {
      status: data.status,
      sms: data.sms || [],
      hasCode: !!extractedCode,
      isReceived: isStatusReceived && !!extractedCode,
      code: extractedCode || null,
      text: firstSMS?.text || null
    };
  } catch (error) {
    console.error(`❌ Quick check failed:`, error);
    throw error;
  }
};

/**
 * Reuse a number that has timed out or finished
 * @param {string} product - The product code (e.g., 'facebook')
 * @param {string} phoneNumber - The phone number to reuse
 * @param {string} authToken - Firebase ID token
 * @returns {Promise<Object>} - New order details
 */
export const reuseNumber = async (product, phoneNumber, authToken) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/5sim/reuse`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product, phoneNumber })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reuse number');
    }

    return {
      success: true,
      orderId: data.id,
      number: data.phone,
      order: data
    };
  } catch (error) {
    console.error(`❌ Reuse number failed:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel a phone number order
 * @param {string} orderId - The 5SIM order ID
 * @param {string} authToken - Firebase ID token
 * @returns {Promise<Object>} - Cancel result
 */
export const cancelOrder = async (orderId, authToken) => {
  try {
    console.log(`📡 Requesting cancel for order: ${orderId}`);
    const response = await fetch(`${API_BASE}/api/5sim/cancel/${orderId}`, {
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : undefined,
        'Accept': 'application/json'
      }
    });
    
    // Explicitly handle 400 Bad Request which may come from 5SIM
    if (response.status === 400) {
      const data = await response.json();
      return { error: data.error || 'Request failed with 5SIM status 400 (Bad Order State)' };
    }

    if (!response.ok) {
       const text = await response.text();
       return { error: `Request failed with status code ${response.status}: ${text.substring(0, 50)}` };
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Cancel failed:`, error);
    return { error: error.message };
  }
};

/**
 * Ban a phone number (if no SMS received)
 * @param {string} orderId - The 5SIM order ID
 * @param {string} authToken - Firebase ID token
 * @returns {Promise<Object>} - Ban result
 */
export const banNumber = async (orderId, authToken) => {
  try {
    console.log(`📡 Requesting ban for order: ${orderId}`);
    const response = await fetch(`${API_BASE}/api/5sim/ban/${orderId}`, {
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : undefined,
        'Accept': 'application/json'
      }
    });

    if (response.status === 400) {
      const data = await response.json();
      return { error: data.error || 'Request failed with 5SIM status 400 (Bad Order State)' };
    }

    if (!response.ok) {
       const text = await response.text();
       return { error: `Request failed with status code ${response.status}: ${text.substring(0, 50)}` };
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Ban failed:`, error);
    return { error: error.message };
  }
};
