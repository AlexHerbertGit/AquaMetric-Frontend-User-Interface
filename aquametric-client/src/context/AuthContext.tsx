import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type AuthResponse, type AuthUser, fetchMe, loginUser, registerUser } from "../services/auth";
import { clearToken, setToken } from "../lib/auth";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  register: (input: { organizationId: number; firstName: string; lastName: string; email: string; password: string; }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { // hydrate from token
    (async () => {
      setLoading(true);
      try {
        const me = await fetchMe();
        setUser(me);
      } catch { /* not logged in or /me unavailable */ }
      finally { setLoading(false); }
    })();
  }, []);

  async function register(input: { organizationId: number; firstName: string; lastName: string; email: string; password: string; }) {
    setLoading(true); setError(null);
    try {
      const res: AuthResponse = await registerUser(input);
      setToken(res.token);
      setUser(res.user);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Registration failed");
      throw e;
    } finally { setLoading(false); }
  }
  async function login(email: string, password: string) {
    setLoading(true); setError(null);
    try {
      const res: AuthResponse = await loginUser({ email, password });
      setToken(res.token);
      setUser(res.user);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Login failed");
      throw e;
    } finally { setLoading(false); }
  }
  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, error, register, login, logout }), [user, loading, error]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}