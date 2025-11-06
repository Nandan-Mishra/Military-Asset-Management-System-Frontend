import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Generates a unique tab ID for isolating user sessions across browser tabs
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

// Returns tab-specific localStorage keys for token and user data
const getStorageKeys = () => {
  const tabId = getTabId();
  return {
    token: `token_${tabId}`,
    user: `user_${tabId}`,
  };
};

// Custom hook to access authentication context and user data
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication context provider managing user state and session across tabs
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial auth state
  useEffect(() => {
    const loadAuthState = () => {
      const storageKeys = getStorageKeys();
      const token = localStorage.getItem(storageKeys.token);
      const savedUser = localStorage.getItem(storageKeys.user);
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse user data:', e);
          const storageKeys = getStorageKeys();
          localStorage.removeItem(storageKeys.token);
          localStorage.removeItem(storageKeys.user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadAuthState();

    // Only listen for storage changes if they affect THIS tab's keys
    const handleStorageChange = (e) => {
      const storageKeys = getStorageKeys();
      if (e.key === storageKeys.token || e.key === storageKeys.user) {
        loadAuthState();
      }
    };

    // Listen for custom auth-change events (same tab)
    const handleAuthChange = () => {
      loadAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // Handles user login and registration with tab-specific session management
  const login = async (email, password, role, username, fullName, baseId) => {
    try {
      const requestData = {
        email,
        password,
        role,
      };
      
      // Only include registration fields if they're provided (for new registration)
      if (username) requestData.username = username;
      if (fullName && fullName !== 'New User') requestData.fullName = fullName;
      if (baseId) requestData.baseId = baseId;

      const response = await authAPI.login(requestData);
      
      const { token, user: userData, mode } = response.data;

      // If the request was a registration, do NOT persist auth/session
      if (mode === 'register') {
        return { success: true, mode };
      }

      // Otherwise (login), persist the session using tab-specific keys
      const storageKeys = getStorageKeys();
      localStorage.setItem(storageKeys.token, token);
      localStorage.setItem(storageKeys.user, JSON.stringify(userData));
      setUser(userData);
      
      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new Event('auth-change'));
      
      return { success: true, mode };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Clears user session and authentication state
  const logout = () => {
    const storageKeys = getStorageKeys();
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
    setUser(null);
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new Event('auth-change'));
  };

  const isAdmin = () => user?.role === 'admin';
  const isBaseCommander = () => user?.role === 'base_commander';
  const isLogisticsOfficer = () => user?.role === 'logistics_officer';

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isBaseCommander,
    isLogisticsOfficer,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

