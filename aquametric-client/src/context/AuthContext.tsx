import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, register as apiRegister, me as apiMe, logout as apiLogout } from "../services/auth";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";

interface Ctx {
  user: AuthUser | null;
  loading: boolean;
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>; // ✨ added
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void refresh(); }, []);

  async function refresh() {
    setLoading(true);
    try {
      const token = localStorage.getItem("am_token");
      setUser(token ? await apiMe() : null);
    } finally {
      setLoading(false);
    }
  }

  async function login(p: LoginPayload) {
    await apiLogin(p);        // stores token
    const u = await apiMe();  // fetch user
    setUser(u);
}

  async function register(p: RegisterPayload) {
    const res = await apiRegister(p); // stores token in localStorage
    setUser(res.user);                // auto-login after register
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}