import React, { createContext, useContext, useState, useEffect } from 'react';

// =========================================================================
// IMPORT CENTRALIZED ROUTING ROUTE PATHWAY
// =========================================================================
import { API_BASE_URL } from './api'; 

const AuthContext = createContext();

// Appends the /auth namespace endpoint smoothly onto your central base route
const API_AUTH_URL = `${API_BASE_URL}/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Read initialized cache on mount to discover active login sessions
  useEffect(() => {
    const storedUser = localStorage.getItem('archive_user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login signature mismatch.');

      localStorage.setItem('archive_user_session', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed.');

      localStorage.setItem('archive_user_session', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('archive_user_session');
    setUser(null);
  };

  // Extract the raw JWT token string out of the active user object
  const token = user?.token || null;

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}