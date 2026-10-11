/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { api } from '@/lib/api';
import type { LoginResponse, MeResponse, PublicUser } from '@/types';

type Status = 'loading' | 'anon' | 'authed';

interface AuthContextValue {
  status: Status;
  user: PublicUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    api
      .get<MeResponse>('/auth/me')
      .then(({ user: current }) => {
        setUser(current);
        setStatus('authed');
      })
      .catch(() => {
        setUser(null);
        setStatus('anon');
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: logged } = await api.post<LoginResponse>('/auth/login', { email, password });
    setUser(logged);
    setStatus('authed');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post<{ ok: boolean }>('/auth/logout', {});
    } finally {
      setUser(null);
      setStatus('anon');
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
}