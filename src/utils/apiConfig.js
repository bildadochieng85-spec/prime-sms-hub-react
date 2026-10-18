const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

export const API_BASE_URL = (
  configuredApiUrl || 'https://api.primesmshub.space'
).replace(/\/+$/, '');
