// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? 'http://localhost:3007'
    : import.meta.env.VITE_API_URL || 'https://web-production-e7159.up.railway.app',
  
  WS_URL: isDevelopment 
    ? 'http://localhost:3007'
    : import.meta.env.VITE_WS_URL || 'wss://web-production-e7159.up.railway.app'
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
  baseUrl: API_CONFIG.BASE_URL,
  wsUrl: API_CONFIG.WS_URL
}); 