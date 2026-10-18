// src/firebasejs/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCSpzeyhwzuq_DrSRqcKNdZBxDTXPnSS3o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "prime-sms-hub-661cc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "prime-sms-hub-661cc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "prime-sms-hub-661cc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1049442796038",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1049442796038:web:c3de3a11fd5d0243523987",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LWGBT09TLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with offline-first settings to prevent unnecessary network calls on free tier
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Analytics initialization (optional)
let analytics;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (err) {
  console.warn('Analytics disabled:', err.message);
}

export { auth, db, analytics };
export default app;