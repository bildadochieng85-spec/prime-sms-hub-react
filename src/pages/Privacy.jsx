import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Legal.css';

export default function Privacy({ onNavigate, theme }) {
  return (
    <div className={`legal-page-container terms-page privacy-page ${theme || 'dark'}`}>
      <Helmet>
        <title>Privacy Policy - PrimeSmsHub</title>
        <meta name="description" content="Learn how PrimeSmsHub collects, uses, and protects your personal data. Read our complete privacy policy." />
        <meta property="og:title" content="Privacy Policy - PrimeSmsHub" />
        <meta property="og:description" content="PrimeSmsHub Privacy Policy - Learn how we protect your data." />
        <meta property="og:url" content="https://primesmshub.space/privacy" />
        <meta name="canonical" content="https://primesmshub.space/privacy" />
        <link rel="alternate" hreflang="en" href="https://primesmshub.space/privacy" />
        <link rel="alternate" hreflang="en-NG" href="https://ng.primesmshub.space/privacy" />
        <link rel="alternate" hreflang="x-default" href="https://primesmshub.space/privacy" />
      </Helmet>

      <div className="legal-header terms-header">
        <button className="terms-back-button" onClick={() => onNavigate('signup')}>
          <span aria-hidden="true">←</span> Back to Sign Up
        </button>
        <div className="terms-heading">
          <span className="terms-kicker">PRIMESMSHUB · YOUR PRIVACY</span>
          <h1>Privacy Policy</h1>
          <p>Learn how we collect, use, and protect your information.</p>
          <span className="terms-updated">Last updated <strong>October 2026</strong></span>
        </div>
      </div>
      
      <div className="legal-content glass-card terms-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request customer support, or otherwise communicate with us. This includes your name, email address, and transaction history.</p>
        </section>
        
        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to process transactions, and to send you related information, including confirmations and receipts.</p>
        </section>
        
        <section>
          <h2>3. Information Sharing</h2>
          <p>We do not share your personal information with third parties except as necessary to process payments or as required by law.</p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        </section>
      </div>
    </div>
  );
}
