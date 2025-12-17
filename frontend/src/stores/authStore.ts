import { create } from 'zustand';
import api from '../lib/api';

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// Helper to decode JWT and check expiry
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

// Initialize state from localStorage
function getInitialState(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  
  if (token && userStr && !isTokenExpired(token)) {
    try {
      const user = JSON.parse(userStr) as User;
      return { user, token, isAuthenticated: true };
    } catch {
      // Invalid stored data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  } else if (token) {
    // Token expired - clean up
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
  
  return { user: null, token: null, isAuthenticated: false };
}


export const useAuthStore = create<AuthStore>((set, get) => ({
  ...getInitialState(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Persist to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Set up auto-logout timer
        setupAutoLogout(token, get().logout);
        
        return true;
      }
      
      set({ isLoading: false, error: 'Login failed' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  register: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/auth/register', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Persist to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Set up auto-logout timer
        setupAutoLogout(token, get().logout);
        
        return true;
      }
      
      set({ isLoading: false, error: 'Registration failed' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear any pending auto-logout timer
    if (autoLogoutTimer) {
      clearTimeout(autoLogoutTimer);
      autoLogoutTimer = null;
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    
    if (token && isTokenExpired(token)) {
      // Token expired - logout
      get().logout();
    } else if (token) {
      // Set up auto-logout for remaining time
      setupAutoLogout(token, get().logout);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Auto-logout timer reference
let autoLogoutTimer: ReturnType<typeof setTimeout> | null = null;

function setupAutoLogout(token: string, logout: () => void): void {
  // Clear any existing timer
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const timeUntilExpiry = exp - Date.now();
    
    if (timeUntilExpiry > 0) {
      // Set timer to logout 1 minute before expiry (or immediately if less than 1 min)
      const logoutTime = Math.max(timeUntilExpiry - 60000, 0);
      autoLogoutTimer = setTimeout(() => {
        logout();
      }, logoutTime);
    }
  } catch {
    // Invalid token - ignore
  }
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
    return axiosError.response?.data?.error?.message || 'An error occurred';
  }
  return 'An error occurred';
}

export default useAuthStore;
