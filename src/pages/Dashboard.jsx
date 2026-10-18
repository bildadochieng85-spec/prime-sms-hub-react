import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, 
  collection, query, where, onSnapshot, orderBy, limit, deleteDoc, serverTimestamp, addDoc,
  getDocs, writeBatch, arrayUnion
} from 'firebase/firestore';
import { db, auth } from '../firebasejs/config';
import axios from 'axios';
import SMSDisplay from '../components/SMSDisplay';
import OrderStatusDetail from '../components/OrderStatusDetail';
import { getServiceLogo } from '../utils/serviceLogo';
import { API_BASE_URL } from '../utils/apiConfig';
import './Dashboard.css';
import { useModal } from '../context/ModalContext';

// API Keys from environment variables
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const BACKEND_URL = API_BASE_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME || 'PrimeSmsHub';

// Exchange rate (1 KES = 0.0078 USD) - Now dynamic from backend
let KES_TO_USD_RATE = 0.0078;
let NGN_TO_USD_RATE = 0.000738;

const Dashboard = ({ onNavigate, user, theme, setTheme }) => {
  const { showConfirm } = useModal();
  // ==================== STATE VARIABLES ====================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState({ 
    fullName: 'User', 
    wallet: 0, 
    telegramId: null,
    email: '',
    phone: ''
  });
  const [paystackKey, setPaystackKey] = useState(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_1360357981b26244290e833fb700ea775063618b');
  const [flutterwaveKey, setFlutterwaveKey] = useState(import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '');
  const [transactions, setTransactions] = useState([]);
  const [activeNumbers, setActiveNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Page state
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Country selection state
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryData, setSelectedCountryData] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Service selection state
  const [services, setServices] = useState([]);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [servicePrices, setServicePrices] = useState({});
  const [serviceSearch, setServiceSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  
  // SMS states
  const [smsMessages, setSmsMessages] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkingSms, setCheckingSms] = useState(false);
  
  // Telegram states
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramCode, setTelegramCode] = useState('');
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyError, setKeyError] = useState(null);
  
  // Payment states
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pollingOrderId, setPollingOrderId] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Orders View States
  const [activeOrdersTab, setActiveOrdersTab] = useState('active'); // 'active' or 'history'
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersServiceFilter, setOrdersServiceFilter] = useState('All');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('All');
  const [ordersDateFilter, setOrdersDateFilter] = useState('');

  const fetchActiveNumbers = () => {
    console.log("♻️ Refreshing numbers (manual trigger)");
    showToast('Refreshing activation history...', 'success');
  };


  // ==================== HELPER FUNCTIONS ====================
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Open sidebar on desktop for a persistent navigation drawer, close on mobile
      setSidebarOpen(desktop);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountryFlag = (countryCode) => {
    return (
      <img
        src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
        alt="flag"
        style={{ width: '24px', height: '18px', borderRadius: '3px', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  };
  const getCurrencySymbol = () => currency === 'NGN' ? '₦' : '$';

  const formatBalance = (amountInUSD) => {
    if (currency === 'NGN') {
      // 1 NGN = NGN_TO_USD_RATE USD => amountInNGN = amountInUSD / NGN_TO_USD_RATE
      const inNGN = amountInUSD / NGN_TO_USD_RATE;
      return `₦${inNGN.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amountInUSD.toFixed(2)}`;
  };

  const formatPrice = (priceInUSD) => {
    if (currency === 'NGN') {
       const inNGN = priceInUSD / NGN_TO_USD_RATE;
       return `₦${inNGN.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `$${priceInUSD.toFixed(2)}`;
  };

  // getServiceLogo is imported from ../utils/serviceLogo

  // ==================== LOAD PAYSTACK SCRIPT ====================
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
    if (!window.FlutterwaveCheckout) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);
    }
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const resp = await axios.get(`${BACKEND_URL}/api/config`);
      if (resp.data) {
        if (resp.data.kesToUsdRate) KES_TO_USD_RATE = resp.data.kesToUsdRate;
        if (resp.data.ngnToUsdRate) NGN_TO_USD_RATE = resp.data.ngnToUsdRate;
        console.log('⚙️ Dynamic rates loaded:', { KES: KES_TO_USD_RATE, NGN: NGN_TO_USD_RATE });
      }

      // Fetch Paystack Public Key
      const keyResp = await axios.get(`${BACKEND_URL}/paystack-public-key`);
      if (keyResp.data && keyResp.data.publicKey) {
        setPaystackKey(keyResp.data.publicKey);
        console.log('⚙️ Paystack key loaded from backend');
      }

      // Fetch Flutterwave Public Key
      try {
        const fwKeyResp = await axios.get(`${BACKEND_URL}/flutterwave-public-key`);
        if (fwKeyResp.data && fwKeyResp.data.publicKey) {
          setFlutterwaveKey(fwKeyResp.data.publicKey);
          console.log('⚙️ Flutterwave key loaded from backend');
        }
      } catch (fwErr) {
        console.warn('Could not fetch Flutterwave key:', fwErr.message);
      }
    } catch (err) {
      console.warn('Could not fetch dynamic config:', err.message);
    }
  };

  // ==================== REAL-TIME LISTENERS ====================
  useEffect(() => {
    // allow fallback to auth.currentUser when `user` prop isn't passed
    const activeUser = user || auth.currentUser;
    if (!activeUser) return;

    console.log("🟢 Setting up real-time listeners for user:", activeUser.uid);
    setCurrentUser(activeUser);
    
    const unsubscribers = [];
    
    try {
      // ===== 1. USER DOCUMENT LISTENER =====
      const userRef = doc(db, 'users', activeUser.uid);
      const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          
          // CRITICAL: Check if user is banned in real-time
          // ONLY trigger logout if data is server-confirmed to avoid stale cache issues after unban
          const status = (firestoreData.status || '').toLowerCase().trim();
          if (status === 'banned' && !docSnap.metadata.fromCache) {
            console.warn("🚫 User is banned (Server Confirmed) - Logging out");
            signOut(auth);
            if (onNavigate) onNavigate('login');
            return;
          }

          console.log("👤 User auto-updated - Wallet: $", firestoreData.wallet);
          setUserData(prev => ({
            ...prev,
            ...firestoreData,
            wallet: firestoreData.wallet || 0
          }));
        } else {
          // Create user if doesn't exist
          const newUser = {
            email: user.email,
            fullName: user.displayName || user.email?.split('@')[0] || 'User',
            wallet: 0,
            phone: '',
            country: '',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          };
          // when activeUser is from auth.currentUser, use that object for fields
          const emailVal = activeUser.email;
          const displayNameVal = activeUser.displayName;
          const prepared = {
            ...newUser,
            email: emailVal,
            fullName: displayNameVal || emailVal?.split('@')[0] || 'User'
          };
          setDoc(userRef, prepared);
          setUserData(prepared);
        }
      }, (error) => {
        console.error("User listener error:", error);
        if (error.code === 'permission-denied') {
          console.warn("🔐 Access denied by Firestore Rules. If you were recently unbanned, please refresh your session.");
          // Don't auto-redirect here, let the user see the mount error instead
          setError('Security access denied. Check if your account is restricted.');
        } else {
          setError('Firestore connection unavailable - using local data');
        }
      });
      unsubscribers.push(unsubscribeUser);

      // Update rates if available in settings
      const settingsRef = doc(db, 'adminSettings', 'global');
      const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Update rates if available in settings
          if (data.usdToNgnRate) NGN_TO_USD_RATE = 1 / Number(data.usdToNgnRate);
          if (data.usdToKesRate) KES_TO_USD_RATE = 1 / Number(data.usdToKesRate);
        }
      });
      unsubscribers.push(unsubscribeSettings);
      
      // ===== 2. TRANSACTIONS LISTENER =====
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('uid', '==', activeUser.uid),
        orderBy('createdAt', 'desc')
        // Removed limit(20) to load all historical transactions for accurate reconciliation
      );
      
      const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const txList = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          
          let createdAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt.seconds) {
              createdAt = new Date(data.createdAt.seconds * 1000);
            }
          }
          
          txList.push({
            id: doc.id,
            ...data,
            createdAt: createdAt
          });
        });
        console.log("📊 Transactions auto-updated:", txList.length);
        setTransactions(txList);

        // Ensure user's document contains these transaction ids (helps when server/webhook writes transactions)
        (async () => {
          try {
            const uidForSync = user?.uid || currentUser?.uid;
            if (!uidForSync) return;
            const txIds = txList.map(t => t.id).filter(Boolean);
            if (txIds.length === 0) return;
            const userRefForSync = doc(db, 'users', uidForSync);
            await updateDoc(userRefForSync, {
              transactions: arrayUnion(...txIds)
            });
          } catch (err) {
            // non-fatal: log and continue
            console.warn('Could not sync transactions into user doc:', err);
          }
        })();
      }, (error) => {
        console.error("Transactions listener error:", error);
        setTransactions([]); // Use empty array as fallback
      });
      unsubscribers.push(unsubscribeTransactions);
      
      // ===== 3. ACTIVE NUMBERS LISTENER =====
      const numbersQuery = query(
        collection(db, 'activeNumbers'),
        where('uid', '==', activeUser.uid),
        orderBy('purchasedAt', 'desc')
      );
      
      const unsubscribeNumbers = onSnapshot(numbersQuery, (snapshot) => {
        const numbersList = [];
        const now = new Date();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;

        snapshot.forEach(doc => {
          const data = doc.data();
          const purchasedAt = data.purchasedAt?.toDate?.() || new Date();
          
          numbersList.push({
            id: doc.id,
            ...data,
            purchasedAt: purchasedAt,
            expiresAt: data.expiresAt?.toDate?.() || new Date(purchasedAt.getTime() + 15 * 60000)
          });
        });
        console.log("📱 Active numbers auto-updated:", numbersList.length);
        setActiveNumbers(numbersList);
      }, (error) => {
        console.error("Numbers listener error:", error);
        setActiveNumbers([]); // Use empty array as fallback
      });
      unsubscribers.push(unsubscribeNumbers);
    } catch (err) {
      console.error('⚠️ Firestore setup error (continuing with offline mode):', err);
    }
    
    // Load the service catalog first; country-specific prices load after a service is chosen.
    loadCountries().catch((loadError) => {
      setError('Could not load countries. Please refresh and try again.');
      console.error('Could not load dashboard countries:', loadError);
    });
    loadServices('england', true).catch((loadError) => {
      setError('Could not load services. Please refresh and try again.');
      console.error('Could not load dashboard services:', loadError);
    });
    checkTelegramLink(activeUser);
    
    // Cleanup listeners
    return () => {
      console.log("🔴 Cleaning up listeners");
      unsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.warn('Error cleaning up listener:', err);
        }
      });
    };
  }, [user]);

  // Debug: log transactions updates so we can verify listener activity
  useEffect(() => {
    try {
      console.log('🔁 Transactions state updated:', transactions.slice(0,5));
    } catch (e) {}
  }, [transactions]);

  // ==================== WALLET RECONCILIATION ====================
  // Recalculate wallet from all transactions and fix if needed
  useEffect(() => {
    if (transactions.length === 0 || !currentUser?.uid) return;

    (async () => {
      try {
        // Calculate correct wallet balance from all transactions
        let calculatedBalance = 0;
        
        transactions.forEach(tx => {
          let amount = Number(tx.amount) || 0;
          
          
          
          if (tx.type === 'credit') {
            calculatedBalance += amount; // Add funded amount
          } else if (tx.type === 'debit') {
            calculatedBalance -= amount; // Subtract purchase amount
          }
        });

        calculatedBalance = Number(calculatedBalance.toFixed(2));

        console.log('💰 Wallet Reconciliation:', {
          currentWallet: userData.wallet,
          calculatedBalance,
          transactionCount: transactions.length,
          needsUpdate: Math.abs((userData.wallet || 0) - calculatedBalance) > 0.01
        });

        // If wallet is wrong, fix it
        if (Math.abs((userData.wallet || 0) - calculatedBalance) > 0.01) {
          console.log(`🔄 Fixing wallet: ${userData.wallet} → ${calculatedBalance}`);
          
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            wallet: calculatedBalance,
            walletReconciledAt: serverTimestamp(),
            reconciliationNote: `Auto-reconciled from ${transactions.length} transactions`
          });
          
          setUserData(prev => ({ ...prev, wallet: calculatedBalance }));
          console.log('✅ Wallet reconciliation complete');
        }
      } catch (err) {
        console.error('❌ Wallet reconciliation error:', err.message);
      }
    })();
  }, [transactions, currentUser?.uid]);

  // ==================== FIX INCORRECTLY CONVERTED TRANSACTIONS ====================
  // Fix transactions where KES wasn't properly converted (1 KES showing as $1 instead of $0.06)
  useEffect(() => {
    if (transactions.length === 0 || !currentUser?.uid) return;

    (async () => {
      try {
        const batch = writeBatch(db);
        let fixedCount = 0;

        transactions.forEach(tx => {
          // Check if transaction has local currency but amount is wrong
          const isKES = tx.originalCurrency === 'KES';
          const isNGN = tx.originalCurrency === 'NGN';
          
          if ((isKES || isNGN) && tx.amount !== undefined) {
            const rate = isKES ? KES_TO_USD_RATE : NGN_TO_USD_RATE;
            const correctAmount = Number((tx.originalAmount * rate).toFixed(2));
            
            // If amount doesn't match the conversion, fix it
            if (Math.abs((tx.amount || 0) - correctAmount) > 0.001) {
              console.log(`🔧 Fixing transaction ${tx.id}: ${tx.amount} → ${correctAmount} (${tx.originalAmount} ${tx.originalCurrency} × ${rate})`);
              
              const txRef = doc(db, 'transactions', tx.id);
              batch.update(txRef, {
                amount: correctAmount,
                correctedAt: serverTimestamp(),
                correctionNote: `Fixed conversion: ${tx.originalAmount} ${tx.originalCurrency} × ${rate} = ${correctAmount} USD`
              });
              
              fixedCount++;
            }
          }
        });

        if (fixedCount > 0) {
          await batch.commit();
          console.log(`✅ Fixed ${fixedCount} transaction(s)`);
        } else {
          console.log('✅ All transactions have correct conversions');
        }
      } catch (err) {
        console.error('❌ Error fixing transactions:', err.message);
      }
    })();
  }, [transactions, currentUser?.uid]);


  // Persist wallet to localStorage so UI won't flash to 0 on refresh
  useEffect(() => {
    const uid = currentUser?.uid || user?.uid;
    if (!uid) return;
    try {
      localStorage.setItem(`wallet_${uid}`, String(userData.wallet || 0));
    } catch (err) {
      // ignore storage errors
    }
  }, [userData.wallet, currentUser, user]);

  // Load wallet from localStorage quickly and fetch Firestore user once
  useEffect(() => {
    if (!user) return;

    // Quick UI fill from localStorage
    try {
      const saved = localStorage.getItem(`wallet_${user.uid}`);
      if (saved !== null) {
        setUserData(prev => ({ ...prev, wallet: Number(saved) }));
      }
    } catch (err) {
      // ignore
    }

    // Fetch latest user doc once to ensure correct wallet value
    (async () => {
      try {
        const userRefOnce = doc(db, 'users', user.uid);
        const userSnapOnce = await getDoc(userRefOnce);
        if (userSnapOnce.exists()) {
          const data = userSnapOnce.data();
          setUserData(prev => ({ ...prev, ...data, wallet: (data.wallet || prev.wallet) }));
        }
      } catch (err) {
        console.warn('Could not fetch user data on mount:', err);
      }
    })();
  }, [user]);

  const checkTelegramLink = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().telegramId) {
        setTelegramLinked(true);
      }
    } catch (error) {
      console.warn('Could not check Telegram link:', error);
    }
  };

  const notifyBackendTelegramLinked = async (userId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/telegram/notify/${userId}`);
    } catch (err) {
      console.warn('Could not notify backend about Telegram link:', err);
    }
  };

  const fetchKeyStatus = async () => {
    setKeyLoading(true);
    setKeyError(null);
    try {
      const resp = await axios.get(`${BACKEND_URL}/api/5sim/key-status`);
      setKeyStatus(resp.data || null);
    } catch (err) {
      setKeyError(err.message || 'Could not fetch key status');
      setKeyStatus(null);
    } finally {
      setKeyLoading(false);
    }
  };

  // ==================== WALLET RECONCILIATION FUNCTION ====================
  const manualReconcileWallet = async () => {
    // These states are not defined in the provided code, assuming they exist or are placeholders.
    // setReconciliationLoading(true);
    // setReconciliationMessage(null);
    
    try {
      const uid = currentUser?.uid || user?.uid;
      if (!uid) throw new Error('User not authenticated');

      // Calculate correct balance from transactions
      let calculatedBalance = 0;
      transactions.forEach(tx => {
        const amount = Number(tx.amount) || 0;
        if (tx.type === 'credit') {
          calculatedBalance += amount;
        } else if (tx.type === 'debit') {
          calculatedBalance -= amount;
        }
      });
      calculatedBalance = Number(calculatedBalance.toFixed(2));

      const oldBalance = userData.wallet || 0;
      console.log('🔧 Manual Reconciliation:', { oldBalance, calculatedBalance, transactions: transactions.length });

      // Update wallet in Firestore
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        wallet: calculatedBalance,
        walletReconciledAt: serverTimestamp(),
        reconciliationNote: `Manual reconciliation from ${transactions.length} transactions`
      });

      setUserData(prev => ({ ...prev, wallet: calculatedBalance }));
      // setReconciliationMessage(`✅ Wallet reconciled! Updated from $${oldBalance.toFixed(2)} to $${calculatedBalance.toFixed(2)} based on ${transactions.length} transactions.`);
      
    } catch (error) {
      console.error('❌ Reconciliation error:', error);
      // setReconciliationMessage(`❌ Error: ${error.message || 'Could not reconcile wallet'}`);
    } finally {
      // setReconciliationLoading(false);
    }
  };

  // ==================== 5SIM INTEGRATION ====================
  const loadCountries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BACKEND_URL}/api/5sim/countries`;
      console.log('🌍 Loading 5sim countries from:', url);
      
      const response = await axios.get(url, {
        timeout: 60000,
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('✅ Countries response:', response.status, response.data ? Object.keys(response.data).length + ' countries' : 'NO DATA');
      
      if (response.data && typeof response.data === 'object') {
        // Parse 5sim format: {country_code: {iso: {...}, prefix: {...}, text_en: "Name", product: {...}}}
        const countryList = Object.keys(response.data).map(countryKey => {
          const countryData = response.data[countryKey];
          const isoCode = Object.keys(countryData.iso || {})[0] || countryKey.substring(0, 2);
          return {
            code: countryKey,
            isoCode: isoCode,
            name: countryData.text_en || countryKey.toUpperCase(),
            prefix: Object.keys(countryData.prefix || {})[0] || '+0',
            image: getCountryFlag(isoCode.toLowerCase())
          };
        });
        setCountries(countryList);
        return countryList;
      }
    } catch (error) {
      console.error('❌ Failed to load countries:', {
        message: error.message,
        status: error.response?.status,
        backend: BACKEND_URL,
        endpoint: `${BACKEND_URL}/api/5sim/countries`,
        networkError: error.isAxiosError && !error.response,
        data: error.response?.data
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = async (country) => {
    setError(null);
    setSelectedCountry(country.code);
    setSelectedCountryData(country);
    try {
      const countryServices = await loadServices(country.code);
      const matchingService = countryServices.find((service) => service.id === selectedService?.id);
      if (!matchingService) {
        setSelectedCountry('');
        setSelectedCountryData(null);
        showToast(`${selectedService?.name || 'This service'} is unavailable in ${country.name}. Choose another country.`, 'error');
        return;
      }
      setSelectedService(matchingService);
    } catch (loadError) {
      setSelectedCountry('');
      setSelectedCountryData(null);
      setError(`Could not load services for ${country.name}. Please try another country.`);
      console.error(`Could not load services for ${country.name}:`, loadError);
    }
  };

  const loadServices = async (countryCode, isCatalog = false) => {
    setLoading(true);
    console.log('📱 Loading 5sim prices for country:', countryCode, 'Backend:', BACKEND_URL);
    
    try {
      const url = `${BACKEND_URL}/api/5sim/services?country=${countryCode}`;
      console.log('🔗 Request URL:', url);
      
      const response = await axios.get(url, {
        timeout: 60000,
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('✅ Prices response:', response.status, response.data ? 'OK' : 'NO DATA');
      
      if (response.data && response.data.products) {
        // Parse 5sim format: {country, products: {product: {operator: {cost, count, rate}}}}
        const servicesList = [];
        const pricesMap = {};
        const operatorsSet = new Set(['Any']); // Always include 'Any' option
        
        console.log('💰 Products available:', Object.keys(response.data.products));
        
        Object.keys(response.data.products).forEach(productName => {
          const productData = response.data.products[productName];
          let minPrice = Infinity;
          
          // Extract operators and prices for this product
          Object.keys(productData).forEach(operatorName => {
            const priceData = productData[operatorName];
            operatorsSet.add(operatorName);
            
            // Track minimum price for this product
            if (priceData.cost && priceData.cost < minPrice) {
              minPrice = priceData.cost;
            }
          });
          
          // Add product with minimum price
          if (minPrice !== Infinity) {
            servicesList.push({
              id: productName,
              name: productName.charAt(0).toUpperCase() + productName.slice(1),
              price: minPrice
            });
            pricesMap[productName] = minPrice;
          }
        });
        
        console.log(`✅ Loaded ${servicesList.length} products, ${operatorsSet.size} operators`);
        setServices(servicesList);
        if (isCatalog) setServiceCatalog(servicesList);
        setServicePrices(pricesMap);
        setOperators(Array.from(operatorsSet));
        return servicesList;
      } else {
        console.warn('⚠️ No products in response');
        setServices([]);
        if (isCatalog) setServiceCatalog([]);
        setOperators(['Any']);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to load prices:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        backend: BACKEND_URL,
        country: countryCode
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==================== FIXED: PURCHASE FUNCTION ====================
  const handleBuyNumber = async (serviceToBuy = null) => {
    const service = serviceToBuy || selectedService;
    if (!service) {
      showToast('Please select a service', 'error');
      return;
    }

    if (!selectedCountry) {
      showToast('Please select a country first', 'error');
      return;
    }

    const uid = currentUser?.uid || user?.uid;
    if (!uid) {
      showToast('User authentication required', 'error');
      return;
    }

    showConfirm(
      'Confirm Purchase',
      `Are you sure you want to purchase a ${service.name} number for $${service.price?.toFixed(2) || '1.00'}?`,
      async () => {
        setLoading(true);
        try {
          if (!selectedCountry || !service.id) {
             throw new Error('Country or Service ID is missing. Please re-select.');
          }
          console.log(`💳 Buying: country=${selectedCountry}, operator=${selectedOperator}, product=${service.id}`);
          
          const response = await axios.post(`${BACKEND_URL}/api/5sim/buy`, {
            country: selectedCountry,
            operator: (selectedOperator || 'any').toLowerCase(),
            product: service.id,
            uid: uid 
          }, {
            timeout: 25000,
            headers: { 'Accept': 'application/json' }
          });
          
          const data = response.data;
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (data && data.phone) {
            const { phone: phoneNumber, id: orderId, price: servicePrice } = data;
            console.log(`✅ 5sim purchase successful via backend: ${orderId} - ${phoneNumber}`);

            // Note: Backend has already deducted wallet and added transaction record.
            // We only need to register the active number for the user's dashboard.
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            
            await addDoc(collection(db, 'activeNumbers'), {
              uid: uid,
              phoneNumber: phoneNumber,
              orderId: orderId,
              country: selectedCountryData?.name || selectedCountry,
              countryCode: selectedCountry,
              service: service.name,
              serviceId: service.id,
              operator: selectedOperator || 'Any',
              price: servicePrice,
              purchasedAt: serverTimestamp(),
              expiresAt: expiresAt,
              status: 'active',
              smsMessages: []
            });
            
            // Touch user doc to trigger listener refresh if needed
            await updateDoc(doc(db, 'users', uid), {
              lastTransactionAt: serverTimestamp()
            });
            
            showToast(`Number purchased: ${phoneNumber}`);
            setCurrentPage('my-orders');
            setSelectedService(null);
            setSelectedOperator('');
          } else {
            throw new Error('Invalid response from purchase API');
          }
        } catch (error) {
          console.error("Purchase error:", error);
          // Extract the most descriptive error message
          const errorMessage = error.response?.data?.error || error.message || 'Purchase failed';
          showToast(errorMessage, 'error');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const notifyAdminWalletFunded = async (fundedAmount, fundedCurrency) => {
    try {
      const userName = currentUser?.name || currentUser?.email || 'A user';
      await addDoc(collection(db, 'notifications'), {
        recipient: 'admin',
        title: 'Wallet Funded',
        message: `${userName} funded their wallet with ${fundedCurrency} ${fundedAmount}.`,
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (err) {
      console.warn('Could not send admin notification:', err);
    }
  };

  // ==================== FIXED: PAYMENT FUNCTION ====================
  const verifyPayment = async (txId, amount, currency) => {
    const uid = currentUser?.uid || user?.uid;
    setPaymentLoading(true);
    console.log('🔵 verifyPayment called:', { txId, amount, currency, uid });

    // Step 1 — Ask backend to verify with Paystack & write to Firestore
    let backendWroteToFirestore = false;
    try {
      const resp = await axios.get(`${BACKEND_URL}/paystack/verify/${encodeURIComponent(txId)}`);
      console.log('✅ Backend verify response:', resp.data);

      // Paystack returns { status: true, data: { status: "success", ... } }
      if (resp.data?.data?.status === 'success') {
        backendWroteToFirestore = true;
        showToast('Payment verified! Wallet has been funded.', 'success');
        notifyAdminWalletFunded(amount, currency);
      } else {
        console.warn('⚠️ Backend returned non-success status:', resp.data?.data?.status);
      }
    } catch (backendErr) {
      console.warn('⚠️ Backend verify call failed — will use client-side fallback:', backendErr.message);
    }

    // Step 2 — Client-side fallback: write directly to Firestore.
    // This covers: Render backend Firebase Admin not configured, CORS errors,
    // network timeouts, or Paystack webhook not set up yet.
    // Uses Paystack reference as idempotency key to prevent double-crediting.
    if (uid) {
      try {
        // Check if a transaction with this reference already exists
        const dupQuery = query(
          collection(db, 'transactions'),
          where('reference', '==', txId)
        );
        const dupSnap = await getDocs(dupQuery);

        if (dupSnap.empty) {
          console.log('📝 No existing transaction found — writing to Firestore (client fallback)...');

          // Convert amount: the state `amount` is what the user typed, `currency` is what they selected
          let amountUSD = parseFloat(amount) || 0;
          const currencyUpper = (currency || 'USD').toUpperCase();
          if (currencyUpper === 'KES') {
            amountUSD = Number((amountUSD * KES_TO_USD_RATE).toFixed(2));
          }
          amountUSD = Number(amountUSD.toFixed(2));

          if (amountUSD <= 0) {
            console.error('❌ Computed credit is zero — skipping write. Amount:', amount, 'Currency:', currency);
            if (!backendWroteToFirestore) showToast('Payment recorded but amount was too small.', 'error');
            setPaymentLoading(false);
            return;
          }

          // Write credit transaction
          const newTxRef = doc(collection(db, 'transactions'));
          await setDoc(newTxRef, {
            uid,
            type: 'credit',
            amount: amountUSD,
            originalAmount: parseFloat(amount),
            originalCurrency: currencyUpper,
            currency: 'USD',
            description: 'Funded wallet via Paystack',
            reference: txId,
            status: 'success',
            createdAt: serverTimestamp(),
            clientFallback: true   // Flag so you can identify these in Firestore
          });

          // Update wallet balance
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          const currentWallet = userSnap.exists() ? (Number(userSnap.data().wallet) || 0) : 0;
          const newWallet = Number((currentWallet + amountUSD).toFixed(2));
          await updateDoc(userRef, {
            wallet: newWallet,
            lastTransactionAt: serverTimestamp()
          });
          console.log(`✅ Client-side fallback complete: +$${amountUSD} → wallet $${currentWallet} → $${newWallet}`);

          if (!backendWroteToFirestore) {
            showToast(`Wallet funded! +$${amountUSD} has been added.`, 'success');
            notifyAdminWalletFunded(amount, currencyUpper);
          }
        } else {
          console.log('✅ Transaction already in Firestore (reference:', txId, ') — no duplicate write.');
          if (!backendWroteToFirestore) {
            showToast('Payment already recorded — wallet is up to date.', 'success');
          }
        }
      } catch (fallbackErr) {
        console.error('❌ Client-side fallback also failed:', fallbackErr);
        if (!backendWroteToFirestore) {
          showToast('Payment went through but wallet update failed. Please contact support with reference: ' + txId, 'error');
        }
      }
    }

    setPaymentLoading(false);
  };

  // ==================== FLUTTERWAVE VERIFICATION ====================
  const verifyFlutterwavePayment = async (txId, amount, currency) => {
    const uid = currentUser?.uid || user?.uid;
    setPaymentLoading(true);
    console.log('🔵 verifyFlutterwavePayment called:', { txId, amount, currency, uid });

    let backendWroteToFirestore = false;
    try {
      const resp = await axios.get(`${BACKEND_URL}/flutterwave/verify/${encodeURIComponent(txId)}`);
      if (resp.data && resp.data.status) {
        backendWroteToFirestore = true;
        showToast('Flutterwave payment verified! Wallet has been funded.', 'success');
        notifyAdminWalletFunded(amount, currency);
      }
    } catch (backendErr) {
      console.warn('⚠️ Flutterwave Backend verify failed — using client fallback:', backendErr.message);
    }

    if (uid) {
      try {
        const dupQuery = query(collection(db, 'transactions'), where('reference', '==', txId));
        const dupSnap = await getDocs(dupQuery);

        if (dupSnap.empty) {
          let amountUSD = parseFloat(amount) || 0;
          const currencyUpper = (currency || 'USD').toUpperCase();
          if (currencyUpper === 'KES') {
            amountUSD = Number((amountUSD * KES_TO_USD_RATE).toFixed(2));
          } else if (currencyUpper === 'NGN') {
            amountUSD = Number((amountUSD * NGN_TO_USD_RATE).toFixed(2));
          }
          amountUSD = Number(amountUSD.toFixed(2));

          if (amountUSD > 0) {
            const newTxRef = doc(collection(db, 'transactions'));
            await setDoc(newTxRef, {
              uid,
              type: 'credit',
              amount: amountUSD,
              originalAmount: parseFloat(amount),
              originalCurrency: currencyUpper,
              currency: 'USD',
              description: 'Funded wallet via Flutterwave',
              reference: txId,
              status: 'success',
              createdAt: serverTimestamp(),
              clientFallback: true
            });

            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const currentWallet = userSnap.exists() ? (Number(userSnap.data().wallet) || 0) : 0;
            const newWallet = Number((currentWallet + amountUSD).toFixed(2));
            await updateDoc(userRef, { wallet: newWallet, lastTransactionAt: serverTimestamp() });

            if (!backendWroteToFirestore) {
              showToast(`Wallet funded! +$${amountUSD} has been added.`, 'success');
              notifyAdminWalletFunded(amount, currencyUpper);
            }
          }
        } else {
          if (!backendWroteToFirestore) showToast('Payment already recorded.', 'success');
        }
      } catch (fallbackErr) {
        if (!backendWroteToFirestore) showToast('Payment succeeded but wallet update failed.', 'error');
      }
    }
    setPaymentLoading(false);
  };


  // ==================== SMS CHECK FUNCTION ====================
  const handleCheckSMS = async (numberId, phoneNumber, orderId) => {
    // We now use the SMSDisplay component which handles polling
    // Just need to set the orderId and make sure we have a fresh token
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      showToast('Authentication error. Please re-login.', 'error');
      return;
    }
    
    setAuthToken(token);
    setPollingOrderId(orderId);
    setSelectedNumber(phoneNumber);
    setSelectedProduct(numberId); // numberId here corresponds to product name in Dashboard.jsx logic
  };

  // ==================== TELEGRAM FUNCTIONS ====================
  const createTelegramLink = async (code, userId) => {
    try {
      const linkRef = doc(db, 'telegramLinks', code);
      await setDoc(linkRef, {
        userId: userId,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        used: false
      });
    } catch (error) {
      console.error('Error creating telegram link:', error);
    }
  };

  const handleLinkTelegram = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setTelegramCode(code);
    setShowTelegramModal(true);
    const uid = currentUser?.uid || user?.uid;
    if (uid) await createTelegramLink(code, uid);
  };

  const verifyTelegramConnection = async () => {
    setTelegramLoading(true);
    
      setTimeout(async () => {
        setTelegramLinked(true);
        setShowTelegramModal(false);
        setTelegramLoading(false);
        showToast('Telegram account linked successfully!');
        
        try {
          const uid2 = currentUser?.uid || user?.uid;
          if (uid2) {
            await updateDoc(doc(db, 'users', uid2), {
              telegramLinked: true,
              telegramLinkedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.warn('Could not update telegram status');
        }
      }, 1500);
  };

  // ==================== PAYSTACK HANDLER ====================
  const handlePaystackPayment = () => {
    if (!amount || parseFloat(amount) < 1) {
      showToast('Please enter a valid amount (minimum 1)', 'error');
      return;
    }
    if (!phoneNumber) {
      showToast('Please enter your phone number', 'error');
      return;
    }
    if (!currentUser?.email) {
      showToast('User email not found', 'error');
      return;
    }

    if (!window.PaystackPop) {
      showToast('Loading payment system...', 'info');
      
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => handlePaystackPayment(), 500);
      };
      script.onerror = () => {
        showToast('Failed to load payment system. Please refresh the page.', 'error');
      };
      document.body.appendChild(script);
      return;
    }

    setPaymentLoading(true);

    try {
      // Log payment details for debugging (remove in production)
      const amountInKobo = Math.round(parseFloat(amount) * 100);
      const currencyLower = currency.toLowerCase();
      console.log('🔵 Paystack Payment Debug:', {
        key: paystackKey?.slice(0, 20) + '...',
        email: currentUser.email,
        amount: parseFloat(amount),
        amountInKobo,
        currency: currencyLower
      });

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: currentUser.email,
        amount: amountInKobo,
        currency: currencyLower,
        ref: 'PSH-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
        metadata: {
          uid: currentUser.uid,
          custom_fields: [
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: phoneNumber
            },
            {
              display_name: "User ID",
              variable_name: "uid",
              value: currentUser.uid
            }
          ]
        },
        callback: function(response) {
          console.log('✅ Paystack payment successful:', response);
          verifyPayment(response.reference, parseFloat(amount), currency);
        },
        onClose: function() {
          console.log('❌ Paystack payment window closed');
          setPaymentLoading(false);
          showToast('Payment window closed', 'info');
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Paystack error:', error);
      showToast('Error initializing payment: ' + (error.message || 'Unknown error'), 'error');
      setPaymentLoading(false);
    }
  };

  // ==================== FLUTTERWAVE HANDLER ====================
  const handleFlutterwavePayment = () => {
    if (!amount || parseFloat(amount) < 1) {
      showToast('Please enter a valid amount (minimum 1)', 'error');
      return;
    }
    if (!phoneNumber) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    if (!window.FlutterwaveCheckout) {
      showToast('Loading Flutterwave...', 'info');
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => setTimeout(() => handleFlutterwavePayment(), 500);
      document.body.appendChild(script);
      return;
    }

    setPaymentLoading(true);
    try {
      const currencyUpper = currency.toUpperCase();
      
      window.FlutterwaveCheckout({
        public_key: flutterwaveKey,
        tx_ref: 'FW-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
        amount: parseFloat(amount),
        currency: currencyUpper,
        payment_options: "card, mobilemoneyghana, mobilemoneyuganda, mobilemoneyrwanda, mobilemoneyzambia, mobilemoneytanzania, ussd",
        customer: {
          email: currentUser?.email || 'user@example.com',
          phone_number: phoneNumber,
          name: currentUser?.displayName || userData.fullName || 'User',
        },
        customizations: {
          title: "Prime SMS Hub",
          description: "Fund Wallet",
        },
        meta: {
          uid: currentUser?.uid
        },
        callback: function (response) {
          console.log("✅ Flutterwave response:", response);
          if (response.status === "successful" || response.status === "completed") {
            verifyFlutterwavePayment(response.tx_ref, parseFloat(amount), currencyUpper);
          }
        },
        onclose: function() {
          console.log('❌ Flutterwave payment window closed');
          setPaymentLoading(false);
          showToast('Payment window closed', 'info');
        }
      });
    } catch (error) {
      console.error('Flutterwave error:', error);
      showToast('Error initializing Flutterwave', 'error');
      setPaymentLoading(false);
    }
  };

  // ==================== CLEANUP FUNCTION ====================
  const cleanExpiredNumbers = async () => {
    try {
      const now = new Date();
      const expiredQuery = query(
        collection(db, 'activeNumbers'),
        where('expiresAt', '<', now),
        where('status', '==', 'active')
      );
      
      const expiredSnap = await getDocs(expiredQuery);
      const batch = writeBatch(db);
      
      expiredSnap.forEach(doc => {
        batch.update(doc.ref, { status: 'expired' });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error cleaning expired numbers:', error);
    }
  };

  // ==================== AUTH FUNCTIONS ====================
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page === 'dashboard') {
      setSelectedCountry('');
      setSelectedService(null);
      setServiceSearch('');
    }
    if (isDesktop === false) {
      setSidebarOpen(false);
    }
  };

  // dashboard-level navigation wrapper passed to Navbar so desktop buttons control this page
  const dashboardNavigate = (page) => {
    // For internal dashboard pages, just update local state so we don't trigger
    // parent-level navigation which may route away from the dashboard.
    const internalPages = ['dashboard','fund-wallet','transactions','my-orders','buy-numbers','usa-numbers','support','service-selection','service-selection'];
    setSidebarOpen(false);
    if (internalPages.includes(page)) {
      setCurrentPage(page);
      return;
    }

    // Otherwise, forward to parent navigation if provided
    setCurrentPage(page);
    if (onNavigate) {
      try { onNavigate(page); } catch (e) {}
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileName, setProfileName] = useState(''); // Added profileName state

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      limit(15)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.timestamp?.toDate?.() || new Date(0);
          const bTime = b.timestamp?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
      setNotifications(msgs);
      setUnreadCount(msgs.filter(m => !m.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markNotificationRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  useEffect(() => {
    setProfileName(userData.fullName || '');
  }, [userData.fullName]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        fullName: profileName
      });
      
      // Update local userData state as well
      setUserData(prev => ({ ...prev, fullName: profileName }));
      
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setToast({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const renderProfileContent = () => (
    <div className="dashboard-profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {userData.fullName?.charAt(0) || 'U'}
          </div>
          <div className="profile-info-header">
            <h2>{userData.fullName || 'User'}</h2>
            <p>{userData.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={profileName} 
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your Full Name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={userData.email} 
              disabled 
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <label>Wallet Balance</label>
            <input 
              type="text" 
              value={formatBalance(userData.wallet || 0)} 
              disabled 
            />
          </div>
          <div className="form-group">
            <label>Account Status</label>
            <div className={`status-pill ${userData.emailVerified ? 'verified' : 'unverified'}`} style={{ padding: '8px 0' }}>
              {userData.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
            </div>
          </div>
          
          <div className="profile-actions">
            <button type="submit" className="save-profile-btn" disabled={profileSaving || profileName === userData.fullName}>
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    const totalSpent = transactions
      .filter(tx => tx.type === 'debit' && tx.status === 'success')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      
    const weekDays = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d; 
    });
    
    const dailySpendings = weekDays.map(dateObj => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const sum = transactions
        .filter(tx => {
          if (!tx.createdAt || tx.type !== 'debit' || tx.status !== 'success') return false;
          let d;
          if (tx.createdAt.toDate) d = tx.createdAt.toDate();
          else if (tx.createdAt.seconds) d = new Date(tx.createdAt.seconds * 1000);
          else d = new Date(tx.createdAt);
          return d.toISOString().split('T')[0] === dateStr;
        })
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      return {
        day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        spend: sum
      };
    });
    
    const maxSpend = Math.max(...dailySpendings.map(d => d.spend), 0.1);
    const filteredServices = serviceCatalog.filter(service =>
      service.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    return (
    <>
      <div className="dashboard-welcome-card">
        <div className="dashboard-welcome-content">
          <span className="dashboard-eyebrow">YOUR PRIME SMS HUB</span>
          <h1>Welcome back, <span className="user-name">{userData.fullName}</span></h1>
          <p>Get your virtual numbers with instant SMS delivery.</p>
        </div>
        <div
          className="dashboard-wallet-info"
          role="button"
          tabIndex={0}
          onClick={() => { setCurrentPage('fund-wallet'); setSidebarOpen(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage('fund-wallet'); setSidebarOpen(false); } }}
          style={{ cursor: 'pointer' }}
        >
          <div className="dashboard-wallet-balance">
            <span className="label">Available Funds</span>
            <span className="amount">{formatBalance(userData.wallet || 0)}</span>
            <span className="dashboard-wallet-hint">Add funds to your wallet <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </div>

      <div className="dashboard-country-selection">
        <div className="dashboard-section-header">
          <div className="dashboard-section-heading">
            <span className="dashboard-eyebrow">GET STARTED</span>
            <h2>Choose a service</h2>
            <p>Select a service first, then pick a country to see live pricing.</p>
          </div>
          <div className="dashboard-search-bar">
             <input
                type="text"
                className="dashboard-search-input"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
              />
              <span className="search-icon">🔍</span>
          </div>
        </div>

        {serviceCatalog.length === 0 ? (
          <div className="dashboard-loading">Loading services...</div>
        ) : (
          <>
            <div className="dashboard-service-grid">
              {filteredServices.length > 0 ? filteredServices.slice(0, 24).map(service => (
                <div
                  key={service.id}
                  className={`smart-card ${selectedService?.id === service.id ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.currentTarget.click();
                    }
                  }}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedCountry('');
                    setSelectedCountryData(null);
                    setServiceSearch('');
                    setCurrentPage('service-selection');
                  }}
                >
                  <span className="smart-service-icon">{getServiceLogo(service.id)}</span>
                  <span className="smart-name">{service.name}</span>
                  <span className="smart-subtext">Choose country <span aria-hidden="true">→</span></span>
                </div>
              )) : (
                <div className="dashboard-empty-services">No services match “{serviceSearch}”. Try another search.</div>
              )}
            </div>
            {filteredServices.length > 24 && (
              <p className="dashboard-service-count">Showing 24 of {filteredServices.length} services. Search to find another.</p>
            )}
          </>
        )}
      </div>

      <div className="dashboard-analytics-section">
        <div className="dashboard-info-banner glass dashboard-analytics-card">
          <div className="info-content">
            <h3 className="dashboard-analytics-title">Weekly spend activity</h3>
            <div className="usage-chart-container">
              {dailySpendings.map((dayData, idx) => {
                const heightPercentage = Math.max((dayData.spend / maxSpend) * 100, 5);
                return (
                  <div className="chart-bar-group" key={idx}>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ height: `${heightPercentage}%` }}></div>
                      <div className="chart-tooltip">${dayData.spend.toFixed(2)}</div>
                    </div>
                    <span className="chart-day-label">{dayData.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-info-banner glass dashboard-analytics-card">
          <div className="info-content">
            <h3 className="dashboard-analytics-title">
              <span>Recent transactions</span>
              <button type="button" className="dashboard-view-all" onClick={() => setCurrentPage('transactions')}>View all</button>
            </h3>
            <div className="recent-activity-table-wrapper">
              <table className="recent-activity-table">
                <tbody>
                  {transactions.slice(0, 4).length > 0 ? transactions.slice(0, 4).map(tx => (
                    <tr key={tx.id}>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`tx-icon ${tx.type === 'debit' ? 'icon-red' : 'icon-green'}`}>
                          {tx.type === 'debit' ? '↑' : '↓'}
                        </span>
                      </td>
                      <td className="tx-desc" style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{tx.type === 'debit' ? 'Purchase' : 'Fund Wallet'}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{(tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date()).toLocaleDateString()}</small>
                      </td>
                      <td className={`tx-amount ${tx.type === 'debit' ? 'text-red' : 'text-green'}`} style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 'bold' }}>
                        {tx.type === 'debit' ? '-' : '+'}${Number(tx.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No recent activity</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-recent-activity">
        <div className="dashboard-section-heading dashboard-overview-heading">
          <span className="dashboard-eyebrow">AT A GLANCE</span>
          <h2>Account overview</h2>
        </div>
        <div className="dashboard-activity-cards">
          <div className="dashboard-activity-card">
            <h3>💰 Wallet Balance</h3>
            <p className="stat">{formatBalance(userData.wallet || 0)}</p>
            <small style={{ color: '#22c55e', fontWeight: 600 }}>Ready to Spend</small>
          </div>
          <div className="dashboard-activity-card">
            <h3>💸 Total Spent</h3>
            <p className="stat">{formatBalance(totalSpent)}</p>
            <small style={{ color: '#0ea5e9', fontWeight: 600 }}>Lifetime Spend</small>
          </div>
          <div className="dashboard-activity-card">
            <h3>🔢 Active Orders</h3>
            <p className="stat">{activeNumbers.length}</p>
            <small style={{ color: '#6366f1', fontWeight: 600 }}>Currently Active</small>
          </div>
          <div className="dashboard-activity-card">
            <h3>🤖 Telegram Bot</h3>
            <p className="stat">{telegramLinked ? 'LINKED' : 'OFFLINE'}</p>
            <small style={{ color: telegramLinked ? '#22c55e' : '#f43f5e', fontWeight: 600 }}>
              {telegramLinked ? 'Real-time Alerts ON' : 'Notifications Offline'}
            </small>
          </div>
        </div>
      </div>
    </>
    );
  };

  const renderServiceContent = () => (
    <div className="dashboard-service-page">
      <button className="dashboard-back-button" onClick={() => {
        setSelectedCountry('');
        setSelectedCountryData(null);
        setCurrentPage('dashboard');
      }}>
        ← Back to Services
      </button>
      
      <div className="dashboard-selected-country-header">
        <span className="dashboard-selected-service-logo">{getServiceLogo(selectedService?.id || '')}</span>
        <div>
          <span className="dashboard-selection-step">STEP 1 · SERVICE</span>
          <h2>{selectedService?.name || 'Choose a service'}</h2>
        </div>
      </div>

      <div className="service-selection-container">
        <div className="dashboard-section-header">
          <h3 style={{ margin: 0 }}>Step 2: Choose a Country</h3>
          <div className="dashboard-search-bar">
             <input
                type="text"
                className="dashboard-search-input"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
              />
              <span className="search-icon">🔍</span>
          </div>
        </div>

        {countries.length === 0 ? (
          <div className="dashboard-loading">Loading countries...</div>
        ) : (
          <div className="smart-grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {countries
              .filter(country =>
                country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                country.code.toLowerCase().includes(countrySearch.toLowerCase())
              )
              .slice(0, 24)
              .map(country => (
                <div
                  key={country.code}
                  className={`smart-card ${selectedCountry === country.code ? 'active' : ''} ${loading ? 'is-loading' : ''}`}
                  aria-disabled={loading}
                  onClick={() => {
                    if (!loading) handleCountrySelect(country);
                  }}
                >
                  <span className="smart-icon">{country.image}</span>
                  <span className="smart-name">{country.name}</span>
                  <span className="smart-subtext">{country.prefix}</span>
                </div>
              ))}
          </div>
        )}

        {selectedCountry && (
          <div className="dashboard-purchase-section">
            <div className="dashboard-purchase-summary">
              <span>{selectedCountryData?.name} · {selectedService?.name}</span>
              <strong>{loading ? 'Checking price...' : formatPrice(selectedService?.price || 0)}</strong>
            </div>
            <button
              className="dashboard-purchase-btn"
              onClick={handleBuyNumber}
              disabled={loading || !selectedService}
            >
              {loading ? 'Loading country price…' : `Continue · ${formatPrice(selectedService?.price || 0)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const getCurrencyRate = (curr) => {
    const rates = { 
      USD: 1, 
      KES: KES_TO_USD_RATE, 
      NGN: NGN_TO_USD_RATE, 
      GHS: 0.063, 
      ZAR: 0.054, 
      EGP: 0.032 
    };
    return rates[curr] || 0.01;
  };

  const renderFundContent = () => (
    <div className="dashboard-fund-page">
      <button className="dashboard-back-button" onClick={() => setCurrentPage('dashboard')}>
        ← Back
      </button>

      <div className="fund-page-header">
        <div>
          <h2>Fund Your Wallet</h2>
          <p className="fund-page-subtitle">Add funds securely via Paystack. All major currencies supported.</p>
        </div>
        <div className="fund-balance-chip">
          <span className="fund-balance-label">Current Balance</span>
          <span className="fund-balance-value">{formatBalance(userData.wallet || 0)}</span>
        </div>
      </div>

      <div className="fund-page-grid">
        {/* LEFT: Payment Form */}
        <div className="fund-form-card">
          <h3 className="fund-form-title">💳 Payment Details</h3>

          <div className="fund-field-group">
            <label className="fund-label">Amount</label>
            <div className="fund-amount-row">
              <input
                type="number"
                className="fund-input fund-amount-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                disabled={paymentLoading}
              />
              <select
                className="fund-input fund-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={paymentLoading}
              >
                <option value="NGN">🇳🇬 NGN</option>
              </select>
            </div>
          </div>

          <div className="fund-field-group">
            <label className="fund-label">Phone Number</label>
            <input
              type="tel"
              className="fund-input"
              placeholder="+1 234 567 890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={paymentLoading}
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="fund-conversion-preview">
              <span>You will receive</span>
              <span className="fund-conversion-amount">
                ${(parseFloat(amount) * getCurrencyRate(currency)).toFixed(2)} USD
              </span>
            </div>
          )}

          <button
            className="fund-pay-btn"
            onClick={handlePaystackPayment}
            disabled={paymentLoading || !amount || !phoneNumber}
          >
            {paymentLoading ? (
              <><span className="fund-spinner"></span> Processing...</>
            ) : (
              <>💳 Pay with Paystack</>
            )}
          </button>

          <button
            className="fund-pay-btn"
            onClick={handleFlutterwavePayment}
            disabled={paymentLoading || !amount || !phoneNumber || !flutterwaveKey}
            style={{ marginTop: '10px', background: '#f5a623', color: '#fff', borderColor: '#f5a623' }}
          >
            {paymentLoading ? (
              <><span className="fund-spinner"></span> Processing...</>
            ) : (
              <>💸 Pay with Flutterwave</>
            )}
          </button>

          <div className="fund-secure-note">
            🔒 Secured by Paystack & Flutterwave · 256-bit SSL Encryption
          </div>
        </div>

        {/* RIGHT: Info Panel */}
        <div className="fund-info-panel">
          <div className="fund-info-header">
            <span className="fund-info-icon-big">⚡</span>
            <h3>Instant Top-Up</h3>
            <p>Funds arrive in your wallet within seconds of payment confirmation.</p>
          </div>

          <ul className="fund-benefits-list">
            <li>
              <span className="fund-benefit-icon">🌍</span>
              <div>
                <strong>6 Currencies Supported</strong>
                <span>NGN, USD, GHS, ZAR, EGP</span>
              </div>
            </li>
            <li>
              <span className="fund-benefit-icon">⚡</span>
              <div>
                <strong>Instant Delivery</strong>
                <span>Balance updated in real-time</span>
              </div>
            </li>
            <li>
              <span className="fund-benefit-icon">🔒</span>
              <div>
                <strong>100% Secure</strong>
                <span>Powered by Paystack — bank-grade security</span>
              </div>
            </li>
            <li>
              <span className="fund-benefit-icon">💬</span>
              <div>
                <strong>24/7 Support</strong>
                <span>We're always here to help</span>
              </div>
            </li>
          </ul>

          <div className="fund-min-notice">
            Minimum deposit: <strong>$1.00</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="bg-decorations">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      {/* Dashboard Top Navbar */}
      <header className="dashboard-top-navbar">
        <div className="dashboard-nav-brand-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            className={`dashboard-hamburger ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className="dashboard-nav-brand" onClick={() => handleNavigation('dashboard')}>
             <img src="/hero.png" alt="PrimeSmsHub" />
             <strong className="brand-text">PrimeSmsHub</strong>
          </div>
        </div>
        
         <div className="dashboard-nav-actions">

           {/* Notification Bell */}
           <div className="dashboard-notification-wrapper">
             <button 
               className={`notification-trigger ${showNotifications ? 'active' : ''}`}
               onClick={() => setShowNotifications(!showNotifications)}
               title="Notifications"
             >
               <span className="icon">🔔</span>
               {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
             </button>

             {showNotifications && (
               <div className="notification-panel glass-card fade-in">
                 <div className="panel-header">
                   <h3>Recent Updates</h3>
                   <button onClick={() => setShowNotifications(false)} className="close-panel">✕</button>
                 </div>
                 <div className="panel-body">
                   {notifications.length > 0 ? (
                     notifications.map(n => (
                       <div key={n.id} className={`notification-row ${n.read ? 'read' : 'unread'}`} onClick={() => markNotificationRead(n.id)}>
                         <div className="notif-dot"></div>
                         <div className="notif-content">
                           <p className="notif-title">{n.title}</p>
                           <p className="notif-text">{n.message}</p>
                           <span className="notif-time">
                             {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                           </span>
                         </div>
                         <button className="notif-delete" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>
                           🗑️
                         </button>
                       </div>
                     ))
                   ) : (
                     <div className="empty-panel">
                       <p>No new notifications</p>
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>

           <button 
             className="theme-toggle dashboard-theme-toggle" 
             onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
             aria-label="Toggle Theme"
           >
             {theme === 'dark' ? (
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
               </svg>
             ) : (
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
               </svg>
             )}
           </button>
            <div 
              className="dashboard-user-badge" 
              onClick={() => handleNavigation('profile')}
              title="View Profile"
            >
              <span className="user-icon">👤</span>
            </div>
        </div>
      </header>


      {/* Premium Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-sidebar-header">
          <h3>PRIME<span style={{ color: 'var(--accent-secondary)' }}>HUB</span></h3>
        </div>
        
        <nav>
          <ul>
            <li className={currentPage === 'dashboard' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('dashboard'); }}>
                <span>🏠</span> Dashboard
              </a>
            </li>
            <li className={currentPage === 'my-orders' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('my-orders'); }}>
                <span>📱</span> My Numbers
              </a>
            </li>
            <li className={currentPage === 'fund-wallet' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('fund-wallet'); }}>
                <span>💳</span> Fund Wallet
              </a>
            </li>
            <li className={currentPage === 'transactions' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('transactions'); }}>
                <span>📜</span> History
              </a>
            </li>
            
            <li className="divider"></li>
            
            <li className={currentPage === 'support' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('support'); }}>
                <span>🎧</span> Support
              </a>
            </li>
            <li className={currentPage === 'profile' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('profile'); }}>
                <span>👤</span> Profile
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                <span>🚪</span> Logout
              </a>
            </li>
          </ul>
        </nav>

        <div className="dashboard-sidebar-telegram">
          {telegramLinked ? (
            <div className="dashboard-telegram-connected">
              <span>✅</span> Bot Connected
            </div>
          ) : (
            <button className="dashboard-telegram-link-btn" onClick={handleLinkTelegram}>
              <span>🤖</span> Connect Bot
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && !isDesktop && (
        <div className="dashboard-overlay show" onClick={() => setSidebarOpen(false)}></div>
      )}

      <main className="dashboard-main-content">
        {error && (
          <div className="dashboard-error">
            ⚠️ {error}
          </div>
        )}
        
        {currentPage === 'dashboard' && renderDashboardContent()}
        {currentPage === 'service-selection' && renderServiceContent()}
        {currentPage === 'buy-numbers' && renderServiceContent()}
        {currentPage === 'fund-wallet' && renderFundContent()}
        {currentPage === 'profile' && renderProfileContent()}
        
        {currentPage === 'my-orders' && (
          pollingOrderId ? (
            /* ---- Full-page Order Detail ---- */
            <div className="order-detail-fullpage">
              <OrderStatusDetail
                orderId={pollingOrderId}
                authToken={authToken}
                onComplete={() => {
                  setPollingOrderId(null);
                  fetchActiveNumbers();
                }}
                service={activeNumbers.find(n => n.orderId === pollingOrderId)?.service}
                phoneNumber={activeNumbers.find(n => n.orderId === pollingOrderId)?.phoneNumber}
                country={activeNumbers.find(n => n.orderId === pollingOrderId)?.country}
                countryFlag={countries.find(c => c.name === activeNumbers.find(n => n.orderId === pollingOrderId)?.country)?.image}
                operator={activeNumbers.find(n => n.orderId === pollingOrderId)?.operator}
                price={activeNumbers.find(n => n.orderId === pollingOrderId)?.price}
                date={activeNumbers.find(n => n.orderId === pollingOrderId)?.purchasedAt?.toLocaleString()}
                status={activeNumbers.find(n => n.orderId === pollingOrderId)?.status}
                currency={currency}
                ngnRate={NGN_TO_USD_RATE}
              />
            </div>
          ) : (
            /* ---- Orders List ---- */
            <div className="dashboard-orders-page-v2">
              {/* Header Tabs */}
              <div className="orders-tabs-container">
                <div
                  className={`orders-tab ${activeOrdersTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveOrdersTab('active')}
                >
                  Active orders
                </div>
                <div
                  className={`orders-tab ${activeOrdersTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveOrdersTab('history')}
                >
                  Order History
                </div>
              </div>

              {/* Notification/Tip Box */}
              <div className="orders-tip-banner">
                <span className="tip-icon">ℹ️</span>
                <p>Please note that the activation history can be periodically cleared by the system. If you require access to the list of previously used numbers, we advise you to save it beforehand.</p>
              </div>

              {/* Filters Row */}
              <div className="orders-filters-row">
                <div className="search-filter-group">
                  <div className="orders-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by number"
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                    />
                  </div>
                  <button className="refresh-orders-btn" onClick={fetchActiveNumbers}>🔄</button>

                  <select
                    className="orders-select-filter"
                    value={ordersServiceFilter}
                    onChange={(e) => setOrdersServiceFilter(e.target.value)}
                  >
                    <option value="All">Service</option>
                    {[...new Set(activeNumbers.map(n => n.service))].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <div className="orders-date-picker">
                    <label>Date</label>
                    <input
                      type="date"
                      value={ordersDateFilter}
                      onChange={(e) => setOrdersDateFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="orders-status-tabs">
                {['Pending', 'Received', 'Finished', 'Timeout', 'Canceled', 'Banned', 'All'].map(status => (
                  <button
                    key={status}
                    className={`status-tab-btn ${ordersStatusFilter === status ? 'active' : ''}`}
                    onClick={() => setOrdersStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="orders-table-wrapper">
                <table className="orders-premium-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Country</th>
                      <th>Price<br/><small>Operator</small></th>
                      <th>Number<br/><small>Code</small></th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeNumbers
                      .filter(n => {
                        if (activeOrdersTab === 'active') {
                          const status = (n.status || '').toUpperCase();
                          if (['TIMEOUT', 'CANCELED', 'BANNED', 'FINISHED'].includes(status)) {
                            return false;
                          }
                          const now = new Date();
                          const limit = new Date(n.expiresAt);
                          if (limit.getTime() < now.getTime()) {
                            return false;
                          }
                        }
                        return true;
                      })
                      .filter(n => {
                        if (ordersStatusFilter === 'All') return true;
                        const status = (n.status || '').toUpperCase();
                        if (ordersStatusFilter === 'Pending') {
                          return status === 'ACTIVE' || status === 'WAITING_SMS' || !['RECEIVED', 'TIMEOUT', 'CANCELED', 'BANNED', 'FINISHED'].includes(status);
                        }
                        return status === ordersStatusFilter.toUpperCase();
                      })
                      .filter(n => {
                        if (ordersServiceFilter === 'All') return true;
                        return n.service === ordersServiceFilter;
                      })
                      .filter(n => {
                        if (!ordersSearch) return true;
                        const query = ordersSearch.toLowerCase();
                        return (
                          (n.phoneNumber?.toLowerCase().includes(query)) ||
                          (n.orderId?.toString().includes(query)) ||
                          (n.service?.toLowerCase().includes(query)) ||
                          (n.country?.toLowerCase().includes(query))
                        );
                      })
                      .filter(n => {
                        if (!ordersDateFilter) return true;
                        try {
                          const purchasedAt = n.purchasedAt?.toDate ? n.purchasedAt.toDate() : new Date(n.purchasedAt);
                          const orderDate = purchasedAt.toISOString().split('T')[0]; // YYYY-MM-DD
                          return orderDate === ordersDateFilter;
                        } catch (e) {
                          return true;
                        }
                      })
                      .map(number => (
                      <tr key={number.id}>
                        <td><small>{number.orderId || number.id}</small></td>
                        <td>
                          <div className="datetime-cell">
                            <span>{new Date(number.purchasedAt).toLocaleDateString()}</span>
                            <small>{new Date(number.purchasedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                          </div>
                        </td>
                        <td
                          onClick={() => {
                            handleCheckSMS(number.id, number.phoneNumber, number.orderId);
                            setPollingOrderId(number.orderId);
                          }}
                          style={{ cursor: 'pointer' }}
                          title="View Details"
                        >
                          <div className="service-cell">
                            {getServiceLogo(number.service, '20px')}
                            <span>{number.service}</span>
                          </div>
                        </td>
                        <td>
                          <div className="country-cell">
                            <span className="country-flag-mini">
                              {countries.find(c => c.name === number.country || c.code === number.country)?.image}
                            </span>
                            <span>{number.country}</span>
                          </div>
                        </td>
                        <td>
                          <div className="price-operator-cell">
                            <strong>{formatPrice(number.price || 1.00)}</strong>
                            <small>{number.operator || 'Any'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="number-code-cell">
                            <div className="phone-line">
                              <span>+{number.phoneNumber}</span>
                              <button className="copy-icon-btn" onClick={() => navigator.clipboard.writeText(number.phoneNumber)}>📋</button>
                            </div>
                            <div className="code-line">
                              {number.status === 'RECEIVED' ? (
                                <span className="received-code">✉️ {number.smsCode || 'Code Received'}</span>
                              ) : (
                                <span className="pending-code">✉️ 0</span>
                              )}
                            </div>
                            {activeOrdersTab === 'active' && (
                              <button
                                className="table-check-sms-btn"
                                onClick={() => {
                                  handleCheckSMS(number.id, number.phoneNumber, number.orderId);
                                  setPollingOrderId(number.orderId);
                                }}
                              >
                                Check SMS
                              </button>
                            )}
                          </div>
                        </td>
                        <td
                          onClick={() => {
                            handleCheckSMS(number.id, number.phoneNumber, number.orderId);
                            setPollingOrderId(number.orderId);
                          }}
                          style={{ cursor: 'pointer' }}
                          title="View Details"
                        >
                          <div className="status-cell">
                            <span className={`status-icon-badge ${number.status?.toLowerCase()}`}>
                              {number.status === 'RECEIVED' ? '✅' :
                               number.status === 'TIMEOUT' ? '⌛' :
                               number.status === 'CANCELED' ? '❌' :
                               number.status === 'BANNED' ? '🚫' : '⌛'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {activeNumbers.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table-msg">No entries found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
        
        {currentPage === 'transactions' && (
          <div className="tx-page">
            {/* Header */}
            <div className="tx-page-header">
              <div>
                <h2>Transaction History</h2>
                <p className="tx-subtitle">{transactions.length} total record{transactions.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="tx-summary-chips">
                <div className="tx-chip tx-chip-balance">
                  <span>Balance</span>
                  <strong>{formatBalance(userData.wallet || 0)}</strong>
                </div>
                <div className="tx-chip tx-chip-credit">
                  <span>Total In</span>
                  <strong>+${transactions.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0).toFixed(2)}</strong>
                </div>
                <div className="tx-chip tx-chip-debit">
                  <span>Total Out</span>
                  <strong>-${transactions.filter(t => t.type === 'debit').reduce((s, t) => s + (t.amount || 0), 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="dashboard-empty-state">
                <p>No transactions yet</p>
                <button className="dashboard-btn" onClick={() => setCurrentPage('fund-wallet')}>
                  Fund Your Wallet
                </button>
              </div>
            ) : (
              <div className="tx-list">
                {transactions.map(tx => (
                  <div key={tx.id} className={`tx-card tx-card-${tx.type || 'credit'}`}>
                    {/* Left accent bar is done via CSS border-left */}
                    <div className="tx-card-icon">
                      {tx.type === 'credit' ? '💳' : '📦'}
                    </div>
                    <div className="tx-card-main">
                      <div className="tx-card-top">
                        <span className="tx-card-desc">
                          {tx.description || (tx.originalAmount ? `${tx.originalAmount} ${tx.originalCurrency}` : tx.type === 'credit' ? 'Wallet Funded' : 'Number Purchase')}
                        </span>
                        <span className={`tx-amount tx-amount-${tx.type || 'credit'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="tx-card-bottom">
                        <span className="tx-ref">
                          {tx.txId ? String(tx.txId).slice(0, 14) + '…' : 'N/A'}
                        </span>
                        <span className="tx-date">{formatDate(tx.createdAt)}</span>
                        <span className={`dashboard-status-badge ${tx.status || 'pending'}`}>
                          {tx.status === 'success' ? '✅ Success' : tx.status === 'refunded' ? '💰 Refunded' : tx.status === 'completed' ? '🏁 Completed' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentPage === 'usa-numbers' && (
          <div className="dashboard-usa-page">
            <h2>🇺🇸 USA Numbers</h2>
            <p>Coming soon...</p>
          </div>
        )}
        
        {currentPage === 'support' && (
          <div className="support-page">
            {/* Header */}
            <div className="support-header">
              <div>
                <h2>Help &amp; Support</h2>
                <p className="support-subtitle">We're here to help you get the most out of PrimeSmsHub.</p>
              </div>
              <div className="support-status-pill">
                <span className="live-indicator-dot"></span>
                All Systems Operational
              </div>
            </div>

            {/* Contact Cards */}
            <div className="support-channels">
              <a href={`mailto:support@primesmshub.com`} className="support-channel-card">
                <span className="support-channel-icon">📧</span>
                <div>
                  <strong>Email Support</strong>
                  <span>support@primesmshub.com</span>
                  <small>Response within 24 hours</small>
                </div>
              </a>
              <a href={`https:t.me/SMSHubPrimeBot`} target="_blank" rel="noreferrer" className="support-channel-card support-channel-telegram">
                <span className="support-channel-icon">✈️</span>
                <div>
                  <strong>Telegram Bot</strong>
                  <span>@{APP_NAME}Bot</span>
                  <small>Instant SMS alerts & help</small>
                </div>
              </a>
              <div className="support-channel-card support-channel-docs">
                <span className="support-channel-icon">📖</span>
                <div>
                  <strong>Documentation</strong>
                  <span>Guides & How-tos</span>
                  <small>Step-by-step instructions</small>
                </div>
              </div>
            </div>

            {/* Telegram Bot Section */}
            <div className="support-telegram-section">
              <div className="support-telegram-info">
                <h3>🤖 Telegram Bot — Real-time Notifications</h3>
                <p>Link your Telegram account to receive instant SMS notifications directly in Telegram the moment a message arrives on your virtual number.</p>
                <ul className="support-telegram-features">
                  <li>⚡ Instant SMS notifications</li>
                  <li>🔔 Purchase confirmations</li>
                  <li>💳 Wallet top-up alerts</li>
                </ul>
              </div>
              <div className="support-telegram-action">
                {telegramLinked ? (
                  <div className="support-telegram-connected">
                    <span>✅</span>
                    <div>
                      <strong>Telegram Connected</strong>
                      <p>You'll receive instant notifications for all activity.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>Not connected yet. Link your account to start receiving real-time alerts.</p>
                    <button className="support-connect-btn" onClick={handleLinkTelegram}>
                      🤖 Connect Telegram Bot
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* FAQ */}
            <div className="support-faq">
              <h3>Frequently Asked Questions</h3>
              <div className="support-faq-list">
                {[
                  {
                    q: 'How do I buy a virtual number?',
                    a: 'Go to the Dashboard, select a country, then choose a service. Click "Buy Number" and the number is activated instantly using your wallet balance.'
                  },
                  {
                    q: 'How long does it take to receive an SMS?',
                    a: 'SMS delivery is real-time. Once a message is sent to your virtual number, it appears in your "My Numbers" section within seconds.'
                  },
                  {
                    q: 'What currencies can I use to fund my wallet?',
                    a: 'We support NGN, USD, GHS, ZAR, and EGP. All amounts are converted to Naira and credited to your wallet instantly after payment.'
                  },
                  {
                    q: 'My number isn\'t receiving SMS — what do I do?',
                    a: 'Try clicking "Check SMS" on your number card. If no messages appear after 5 minutes, the service may be temporarily unavailable. Contact support and we\'ll issue a refund or replacement.'
                  },
                  {
                    q: 'How do refunds work?',
                    a: 'If a number fails to receive an SMS within the validity period, contact us with your order ID and we will process a wallet credit within 24 hours.'
                  },
                ].map((item, i) => (
                  <details key={i} className="faq-item">
                    <summary className="faq-question">{item.q}</summary>
                    <p className="faq-answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>

            
            
            </div>
        
        )}
      </main>

      {/* Fund Wallet page handled by renderFundContent when selected */}

      {/* Telegram Modal */}
      {showTelegramModal && (
        <div className="dashboard-modal">
          <div className="dashboard-modal-content">
            <h3>🔗 Connect Telegram</h3>
            <p>1. Open Telegram and search for <strong>@{APP_NAME}Bot</strong></p>
            <p>2. Start a chat and send this code:</p>
            <div className="dashboard-code-display">{telegramCode}</div>
            <p>3. Click verify after sending</p>
            <div className="dashboard-modal-actions">
              <button 
                className="dashboard-btn-primary" 
                onClick={verifyTelegramConnection}
                disabled={telegramLoading}
              >
                {telegramLoading ? 'Verifying...' : 'Verify Connection'}
              </button>
              <button 
                className="dashboard-btn-secondary" 
                onClick={() => setShowTelegramModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
            {toast.type === 'warning' && '⚡'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;