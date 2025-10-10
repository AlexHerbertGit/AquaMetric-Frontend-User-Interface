export interface RegisterPayload {
  organizationId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface LoginPayload {
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