import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('finnest_user');
    const token = localStorage.getItem('finnest_access_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        // Refresh profile data silently in background
        api.get('/auth/me/')
          .then((res) => {
            setUser(res.data);
            localStorage.setItem('finnest_user', JSON.stringify(res.data));
          })
          .catch(() => {
            // If token invalid, interceptor will handle or clear
          })
          .finally(() => setLoading(false));
      } catch (e) {
        localStorage.removeItem('finnest_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    const { user: userData, tokens } = res.data;
    localStorage.setItem('finnest_access_token', tokens.access);
    localStorage.setItem('finnest_refresh_token', tokens.refresh);
    localStorage.setItem('finnest_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register/', payload);
    const { user: userData, tokens } = res.data;
    localStorage.setItem('finnest_access_token', tokens.access);
    localStorage.setItem('finnest_refresh_token', tokens.refresh);
    localStorage.setItem('finnest_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('finnest_access_token');
    localStorage.removeItem('finnest_refresh_token');
    localStorage.removeItem('finnest_user');
    setUser(null);
  };

  const loginWithOTP = async (email, otpCode) => {
    const res = await api.post('/auth/verify-otp/', {
      email,
      otp_code: otpCode,
      purpose: 'login',
    });
    const { user: userData, tokens } = res.data;
    localStorage.setItem('finnest_access_token', tokens.access);
    localStorage.setItem('finnest_refresh_token', tokens.refresh);
    localStorage.setItem('finnest_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const updateProfile = async (formData) => {
    const res = await api.patch('/auth/me/', formData);
    setUser(res.data);
    localStorage.setItem('finnest_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: Boolean(user?.is_staff || user?.is_superuser),
        currency: user?.profile?.currency || 'BDT',
        login,
        loginWithOTP,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
