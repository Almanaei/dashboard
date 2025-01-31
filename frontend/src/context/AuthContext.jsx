import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5005/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptors for token handling
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found in localStorage');
          setLoading(false);
          return;
        }

        // Decode token to get initial user info
        const decoded = JSON.parse(atob(token.split('.')[1]));
        
        // Fetch complete user data from API
        try {
          const response = await axios.get(`${API_URL}/users/${decoded.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Merge token data with complete user data and normalize the last_login field
          const fullUserData = {
            ...decoded,
            ...response.data,
            // Ensure these important fields from token are preserved
            id: decoded.id,
            role: decoded.role,
            // Normalize last_login field
            last_login: response.data.lastLogin || response.data.last_login || decoded.last_login
          };
          
          setUser(fullUserData);
          console.log('Auth initialized with complete user data:', fullUserData);
        } catch (error) {
          console.error('Error fetching complete user data:', error);
          // Fallback to using just the token data
          setUser(decoded);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user: userData } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        // Merge token data with user data and normalize the last_login field
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const normalizedUser = {
          ...decoded,
          ...userData,
          last_login: userData.lastLogin || userData.last_login || new Date().toISOString()
        };
        setUser(normalizedUser);
        console.log('Login successful:', { token: token.substring(0, 20) + '...', user: normalizedUser });
        return { success: true };
      }
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || 'Failed to login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register'
      };
    }
  };

  const value = {
    user,
    loading,
    token: localStorage.getItem('token'),
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
