import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = { children: ReactNode };

export default function Protected({ children }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page page--loading">Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}