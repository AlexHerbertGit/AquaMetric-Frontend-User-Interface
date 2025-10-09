import { type FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading, error, register, login, logout } = useAuth();

  // Register form state
  const [orgId, setOrgId] = useState<number | "">("");
  const [rFirst, setRFirst] = useState("");
  const [rLast, setRLast] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPass, setRPass] = useState("");

  // Login form state
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    if (orgId === "") return;
    await register({ organizationId: Number(orgId), firstName: rFirst.trim(), lastName: rLast.trim(), email: rEmail.trim(), password: rPass });
  }
  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await login(lEmail.trim(), lPass);
  }

  return (
    <div style={{ display: "grid", gap: 24, padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>AquaMetric</h1>
        <div>
          {user ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span>Signed in as <strong>{user.firstName} {user.lastName}</strong></span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <span>API: {import.meta.env.VITE_API_URL}</span>
          )}
        </div>
      </header>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!user && (
        <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <form onSubmit={onRegister} style={card}>
            <h2>Create account</h2>
            <label style={lbl}>Organization Id
              <input type="number" value={orgId} onChange={(e) => setOrgId(e.target.value === "" ? "" : Number(e.target.value))} required />
            </label>
            <label style={lbl}>First name
              <input value={rFirst} onChange={(e) => setRFirst(e.target.value)} required />
            </label>
            <label style={lbl}>Last name
              <input value={rLast} onChange={(e) => setRLast(e.target.value)} required />
            </label>
            <label style={lbl}>Email
              <input type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} required />
            </label>
            <label style={lbl}>Password
              <input type="password" value={rPass} onChange={(e) => setRPass(e.target.value)} required />
            </label>
            <button type="submit" disabled={loading}>{loading ? "Working…" : "Register"}</button>
          </form>

          <form onSubmit={onLogin} style={card}>
            <h2>Sign in</h2>
            <label style={lbl}>Email
              <input type="email" value={lEmail} onChange={(e) => setLEmail(e.target.value)} required />
            </label>
            <label style={lbl}>Password
              <input type="password" value={lPass} onChange={(e) => setLPass(e.target.value)} required />
            </label>
            <button type="submit" disabled={loading}>{loading ? "Working…" : "Login"}</button>
          </form>
        </section>
      )}

      {user && (
        <section style={card}>
          <h2>Welcome</h2>
          <p>User: <strong>{user.firstName} {user.lastName}</strong> ({user.email})</p>
          <p>Org: <strong>{user.organizationId}</strong> · Role: {user.role || "User"}</p>
          <p><a href="/ingestion">Catch File Upload →</a></p>
        </section>
      )}
    </div>
  );
}

const card: React.CSSProperties = { padding: 16, border: "1px solid #333", borderRadius: 12, display: "grid", gap: 12 };
const lbl: React.CSSProperties = { display: "grid", gap: 6 };