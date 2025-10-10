import api from "../lib/api";
import type { RegisterPayload, LoginPayload, AuthResponse, AuthUser } from "../types/auth";

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
  // Optionally auto-login:
  localStorage.setItem("am_token", data.token);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
  localStorage.setItem("am_token", data.token);
  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem("am_token");
}