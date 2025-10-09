import api from "../lib/api";

export interface RegisterRequest {
  organizationId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthUser {
  userId: number;
  organizationId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function registerUser(input: RegisterRequest) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", input);
  return data;
}
export async function loginUser(input: LoginRequest) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", input);
  return data;
}
export async function fetchMe() {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  return data;
}