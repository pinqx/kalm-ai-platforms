export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  company?: string;
  subscription?: {
    planId: string;
    status: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return !!(token && user && token.length > 10);
};

/**
 * Get current authentication state
 */
export const getAuthState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user: AuthUser | null = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  
  return {
    user,
    token,
    isAuthenticated: !!(token && user && token.length > 10)
  };
};

/**
 * Get current user
 */
export const getCurrentUser = (): AuthUser | null => {
  const { user } = getAuthState();
  return user;
};

/**
 * Get current token
 */
export const getAuthToken = (): string | null => {
  const { token } = getAuthState();
  return token;
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Store authentication data
 */
export const storeAuth = (user: AuthUser, token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Check if current user has admin privileges
 */
export const isAdmin = (user?: AuthUser | null): boolean => {
  const currentUser = user || getCurrentUser();
  
  if (!currentUser) return false;
  
  const adminEmails = [
    'alexfisher@mac.home', 
    'alexfisher.dev@gmail.com',
    'alex@kalm.live',
    'admin@kalm.live',
  ];
  
  return adminEmails.includes(currentUser.email.toLowerCase());
};

/**
 * Validate token format
 */
export const isValidTokenFormat = (token: string | null): boolean => {
  return !!(token && typeof token === 'string' && token.length > 10);
};

/**
 * Check if authentication is expired or invalid
 */
export const isAuthExpired = (): boolean => {
  const { token, user } = getAuthState();
  
  if (!token || !user) return true;
  if (!isValidTokenFormat(token)) return true;
  
  // Additional checks can be added here (e.g., token expiry time)
  return false;
};

/**
 * Refresh authentication state (useful for checking after page reload)
 */
export const refreshAuthState = (): AuthState => {
  const authState = getAuthState();
  
  if (isAuthExpired()) {
    clearAuth();
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
  
  return authState;
}; 