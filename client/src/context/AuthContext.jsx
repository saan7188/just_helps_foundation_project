import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'fundraiser');

  const login = (nextToken, admin = false, nextRole = 'fundraiser') => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('isAdmin', String(admin));
    localStorage.setItem('role', admin ? 'admin' : nextRole);
    setToken(nextToken);
    setIsAdmin(admin);
    setRole(admin ? 'admin' : nextRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('role');
    setToken(null);
    setIsAdmin(false);
    setRole('fundraiser');
  };

  const value = useMemo(
    () => ({ token, isAdmin, role, isAuthenticated: Boolean(token), login, logout }),
    [token, isAdmin, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
