import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authApi } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Logging in user:', { email });
      const response = await authApi.login(email, password);
      console.log('Login response:', response);
      if (response.success && response.data) {
        const { user: loggedInUser, token } = response.data;
        localStorage.setItem('authToken', token);
        setUser(loggedInUser);
        setIsAuthenticated(true);
        console.log('Login successful, user set:', loggedInUser);
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Ensure we don't change authentication state on login failure
      // Only throw the error to be handled by the calling component
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      console.log('Registering user:', { email, username });
      const response = await authApi.register(email, username, password);
      console.log('Register response:', response);
      if (response.success && response.data) {
        const { user: newUser, token } = response.data;
        localStorage.setItem('authToken', token);
        setUser(newUser);
        setIsAuthenticated(true);
        console.log('Registration successful, user set:', newUser);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

