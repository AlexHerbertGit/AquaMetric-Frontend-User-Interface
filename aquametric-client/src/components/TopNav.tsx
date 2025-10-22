import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import aquametricLogo from "../assets/aquamteric-logo.png";

var logo = aquametricLogo
export default function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="top-nav">
      <div className="top-nav__content">
        <Link to="/" className="top-nav__brand">
          <img className="nav-logo" src= {logo}></img>
        </Link>
        <nav className="top-nav__menu">
          {user ? (
            <>
              <Link className="top-nav__link" to="/dashboard">Dashboard</Link>
              <Link className="top-nav__link" to="/vessels/new">New Vessel</Link>
              <Link className="top-nav__link" to="/trips/new">Create Trip</Link>
              <span className="top-nav__user">
                {user.email}{user.organizationId ? ` · Org #${user.organizationId}` : ""}
              </span>
              <button className="button button--ghost button--sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="top-nav__link" to="/login">Login</Link>
              <Link className="button button--primary button--sm" to="/register">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}