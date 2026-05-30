import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Legal.css';

export default function Terms({ onNavigate, theme }) {
  return (
    <div className={`legal-page-container ${theme || 'dark'}`}>
      <Helmet>
        <title>Terms of Service - PrimeSmsHub</title>
        <meta name="description" content="Read PrimeSmsHub's Terms of Service and usage policies for SMS verification numbers and virtual phone numbers." />
        <meta property="og:title" content="Terms of Service - PrimeSmsHub" />
        <meta property="og:description" content="PrimeSmsHub Terms of Service and usage policies." />
        <meta property="og:url" content="https://primesmshub.space/terms" />
        <meta name="canonical" content="https://primesmshub.space/terms" />
        <link rel="alternate" hreflang="en" href="https://primesmshub.space/terms" />
        <link rel="alternate" hreflang="en-NG" href="https://ng.primesmshub.space/terms" />
        <link rel="alternate" hreflang="x-default" href="https://primesmshub.space/terms" />
      </Helmet>

      <div className="legal-header">
        <button className="dashboard-back-button borderless" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginBottom: '20px' }} onClick={() => onNavigate('signup')}>
          ← Back to Sign Up
        </button>
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: October 2026</p>
      </div>
      
      <div className="legal-content glass-card">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using PrimeSmsHub, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>
        
        <section>
          <h2>2. Service Usage</h2>
          <p>You agree to use our SMS verification numbers only for lawful purposes. Any use of our service for fraudulent activities will result in immediate termination of your account without refund.</p>
        </section>
        
        <section>
          <h2>3. Payments and Refunds</h2>
          <p>All deposits to your wallet are final. We do not provide cash refunds. If an SMS fails to deliver within the timeframe, the cost will not be deducted or it will be automatically refunded to your platform wallet.</p>
        </section>

        <section>
          <h2>4. Account Suspension</h2>
          <p>We reserve the right to suspend or terminate accounts that violate our policies or generate excessive chargebacks and suspicious activities.</p>
        </section>
      </div>
    </div>
  );
}
