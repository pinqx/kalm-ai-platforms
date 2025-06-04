// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const API_CONFIG = {
  // In production (kalm.live), use relative URLs that will be proxied to Railway
  // In development, connect directly to Railway for testing
  BASE_URL: isDevelopment ? 'https://web-production-e7159.up.railway.app' : '', 
  
  WS_URL: isDevelopment ? 'wss://web-production-e7159.up.railway.app' : `wss://${window.location.host}`
};

// Helper function to get API URL
export const getApiUrl = (endpoint: string = '') => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWsUrl = () => {
  return API_CONFIG.WS_URL;
};

console.log('🔧 API Configuration:', {
  environment: import.meta.env.MODE,
  isDevelopment,
  baseUrl: API_CONFIG.BASE_URL,
  wsUrl: API_CONFIG.WS_URL
}); 