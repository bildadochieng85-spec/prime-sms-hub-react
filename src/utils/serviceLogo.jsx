import React from 'react';

/**
 * Returns an <img> element for a given service identifier.
 * Falls back to Clearbit logo lookup for unknown services.
 */
export const getServiceLogo = (serviceId, size = '20px') => {
  const sId = (serviceId || '').toLowerCase();
  const fallbackLabel = sId.replace(/[^a-z0-9]/g, '').slice(0, 2).toUpperCase() || '?';
  const fallbackFontSize = `${Math.max(11, Math.round((Number.parseInt(size, 10) || 20) * 0.42))}px`;
  const map = {
    whatsapp: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    telegram: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
    facebook: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    instagram: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
    tiktok: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
    google: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    google_v2: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    twitter: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
    x: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
    viber: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Viber_logo_2018.svg',
    discord: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Discord_logo_2021.svg',
    tinder: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Tinder_logo_1.svg',
  };

  return (
    <>
      <img
        src={map[sId] || `https://logo.clearbit.com/${sId}.com`}
        alt={sId}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px' }}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          const fallback = event.currentTarget.nextElementSibling;
          if (fallback) fallback.hidden = false;
        }}
      />
      <span className="service-logo-fallback" style={{ fontSize: fallbackFontSize }} hidden aria-hidden="true">
        {fallbackLabel}
      </span>
    </>
  );
};
