import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <Link to="/dashboard" className="header__brand">AquaMetric</Link>
      <div className="header__spacer" />
      <nav className="header__right">
        {user ? (
          <>
            <Link className="link" to="/dashboard">Dashboard</Link> {/* ← new */}
            <Link className="link" to="/vessels/new">New Vessel</Link>
            <span className="header__user">
              {user.email}{user.organizationId ? ` · Org #${user.organizationId}` : ""}
            </span>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="link" to="/login">Login</Link>
            <Link className="link" to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}