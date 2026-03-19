import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config.js';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/session`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.isAuthenticated && data.user) {
        setUser(data.user);
        setUserRole(data.user.role);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setUserRole(userData.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    userRole,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
