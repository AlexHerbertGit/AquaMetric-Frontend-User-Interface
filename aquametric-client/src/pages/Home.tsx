import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="center">
      <div className="container stack-md">
        <h1 className="title">AquaMetric</h1>
        <p className="muted">Welcome! Create an account to get started, or log in if you already have one.</p>

        <div className="card-grid">
          <div className="card">
            <h3>New here?</h3>
            <p>Register and join an Organization to get started.</p>
            <Link to="/register" className="btn">Register</Link>
          </div>

          <div className="card">
            <h3>Returning?</h3>
            <p>Log in to continue.</p>
            <Link to="/login" className="btn">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}