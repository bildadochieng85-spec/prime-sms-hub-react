import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Legal.css';

export default function Terms({ onNavigate, theme }) {
  return (
    <div className={`legal-page-container terms-page ${theme || 'dark'}`}>
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

      <div className="legal-header terms-header">
        <button className="terms-back-button" onClick={() => onNavigate('signup')}>
          <span aria-hidden="true">←</span> Back to Sign Up
        </button>
        <div className="terms-heading">
          <span className="terms-kicker">PRIMESMSHUB · SERVICE GUIDELINES</span>
          <h1>Terms of Service</h1>
          <p>Review the terms that apply when using PrimeSmsHub.</p>
          <span className="terms-updated">Last updated <strong>October 2026</strong></span>
        </div>
      </div>
      
      <div className="legal-content glass-card terms-content">
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
