import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData.user || userData);
      } catch (err) {
        console.error('Auth check failed:', err);
        authService.logout();
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithToken = async (token) => {
    setError(null);
    try {
      apiService.setToken(token);
      const userData = await authService.getCurrentUser();
      setUser(userData.user || userData);
    } catch (err) {
      apiService.removeToken();
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    loginWithToken,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
