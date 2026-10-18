import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../utils/apiConfig';
import './Pricing.css';

export default function Pricing({ onNavigate, theme, setTheme }) {
  const [popularPrices, setPopularPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/5sim/services?country=england`);
        const data = await response.json();
        
        if (data && data.products) {
          const targetServices = ['whatsapp', 'telegram', 'google', 'facebook', 'instagram', 'twitter'];
          const pricesList = [];
          
          targetServices.forEach(productName => {
            if (data.products[productName]) {
              const productData = data.products[productName];
              let minPrice = Infinity;
              
              Object.keys(productData).forEach(operatorName => {
                const priceData = productData[operatorName];
                if (priceData.cost && priceData.cost < minPrice) {
                  minPrice = priceData.cost;
                }
              });
              
              if (minPrice !== Infinity) {
                pricesList.push({ 
                  name: productName.charAt(0).toUpperCase() + productName.slice(1), 
                  price: minPrice 
                });
              }
            }
          });
          
          setPopularPrices(pricesList);
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="home-wrapper pricing-page-wrapper">
      <Helmet>
        <title>Pricing - PrimeSmsHub</title>
        <meta name="description" content="View live global pricing for secure virtual numbers." />
      </Helmet>
      <Navbar onNavigate={onNavigate} theme={theme} setTheme={setTheme} />

      <main className="landing-content">
        <div className="bg-decorations">
          <div className="glow-sphere sphere-1"></div>
          <div className="glow-sphere sphere-2"></div>
        </div>

        <section className="pricing-page-section">
          <div className="container">
            <div className="section-header fade-in-up">
              <h1 className="hero-title" style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}>
                Live Global <span className="text-gradient">Pricing</span>
              </h1>
              <p className="section-subtitle" style={{ marginTop: '24px', fontSize: '20px' }}>
                Secure numbers starting from as low as $0.02. Connect instantly to thousands of digital services.
              </p>
            </div>
            
            <div className="pricing-grid fade-in delay-1">
              {loadingPrices ? (
                <div className="loading-spinner-wrapper">
                  <div className="loading-spinner"></div>
                  <p className="loading-message">Establishing secure connection to 5SIM global network...<br/>Fetching real-time prices.</p>
                </div>
              ) : popularPrices.length > 0 ? (
                popularPrices.map((service, idx) => (
                  <div key={idx} className="price-card glass">
                    <div className="price-header">
                      <div className="service-icon-initial">
                         {service.name.charAt(0)}
                      </div>
                      <h3>{service.name}</h3>
                    </div>
                    <div className="price-value">
                      <span className="currency">$</span>
                      <span className="amount">{service.price.toFixed(2)}</span>
                    </div>
                    <button className="btn nav-btn secondary btn-sm price-buy-btn" onClick={() => onNavigate('login')}>Buy Now</button>
                  </div>
                ))
              ) : (
                <p className="no-prices-msg">Unable to load live prices at the moment. Please check back later.</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/hero.png" alt="PrimeSmsHub" className="footer-logo" />
              <h3>PrimeSmsHub</h3>
              <p>The premier destination for secure virtual connectivity and instant SMS verification.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="/#features" onClick={(e) => { e.preventDefault(); onNavigate('home'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Features</a>
                <a href="#pricing">Pricing</a>
                <a className="b" onClick={() => onNavigate('login')}>Buy Numbers</a>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="/#about" onClick={(e) => { e.preventDefault(); onNavigate('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>About Us</a>
                <a href="#contact">Contact</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="mailto:support@primesmshub.com">Email Support</a>
                <a href="#" target="_blank">Telegram Bot</a>
                <a href="#">Help Center</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 PrimeSmsHub. All rights reserved.</p>
            <div className="socials">
              <a href="#">TW</a>
              <a href="#">IG</a>
              <a href="#">TG</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
