import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import apiClient from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'admission_officer' | 'management';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success) {
            const userData = res.data.data;
            if (userData._id && !userData.id) {
              userData.id = userData._id;
            }
            console.log('User authenticated:', userData.email);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Initial auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { accessToken, refreshToken, user: userData } = res.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Ensure ID is set
        if (userData._id && !userData.id) {
          userData.id = userData._id;
        }

        console.log('Login successful, setting user state');
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false); // Set false before returning to ensure clean transitions
        return { success: true };
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
    return { success: false, message: 'Unknown error' };
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
