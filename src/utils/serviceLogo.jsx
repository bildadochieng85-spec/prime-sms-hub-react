import React from 'react';

/**
 * Returns an <img> element for a given service identifier.
 * Falls back to Clearbit logo lookup for unknown services.
 */
export const getServiceLogo = (serviceId, size = '20px') => {
  const sId = (serviceId || '').toLowerCase();
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

  if (map[sId]) {
    return (
      <img
        src={map[sId]}
        alt={sId}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${sId}.com`}
      alt={sId}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: '4px' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
};
