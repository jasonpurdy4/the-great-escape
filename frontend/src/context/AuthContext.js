// Auth Context - Global user authentication state
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [credits, setCredits] = useState(0);

  // Load user profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const response = await getProfile();
          setUser(response.data);
          setBalance(response.data.balance);
          setCredits(response.data.credits);
        } catch (error) {
          // Token invalid or expired
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    }

    loadUser();
  }, [token]);

  // Login function
  const login = (userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    setBalance(userData.balance || 0);
    setCredits(userData.credits || 0);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setBalance(0);
    setCredits(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Refresh user data (after payment, etc.)
  const refreshUser = async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
      setBalance(response.data.balance);
      setCredits(response.data.credits);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Update balance/credits after transaction
  const updateFunds = (newBalance, newCredits) => {
    setBalance(newBalance);
    setCredits(newCredits);
  };

  const value = {
    user,
    token,
    loading,
    balance,
    credits,
    totalFunds: balance + credits,
    isAuthenticated: !!token,
    login,
    logout,
    refreshUser,
    updateFunds
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
