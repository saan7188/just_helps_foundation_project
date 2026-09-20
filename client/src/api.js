const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl && !import.meta.env.DEV) {
  console.warn('VITE_API_URL is not configured. API requests will use the current origin.');
}

const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default API_URL;
