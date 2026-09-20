import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');

  const login = (nextToken, admin = false) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('isAdmin', String(admin));
    setToken(nextToken);
    setIsAdmin(admin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setIsAdmin(false);
  };

  const value = useMemo(
    () => ({ token, isAdmin, isAuthenticated: Boolean(token), login, logout }),
    [token, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
