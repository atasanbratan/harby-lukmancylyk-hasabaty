import { createContext, useCallback, useContext, useState } from 'react';
import * as api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => api.getToken());

  const login = useCallback(async (username, password) => {
    const body = await api.login(username, password);
    setTokenState(body.token);
    return body;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setTokenState(null);
  }, []);

  const value = { authed: Boolean(token), login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
