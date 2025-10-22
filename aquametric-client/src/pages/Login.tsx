import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ use context

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth(); // ✅ context method sets user in state
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email: form.email, password: form.password }); // ✅ updates context.user
      nav("/dashboard"); // ✅ now Protected won't bounce you
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page page--narrow">
      <div className="stack-lg">
        <header className="page-header">
          <h2 className="page-title">Log in</h2>
          <p className="page-subtitle">Access your dashboard to manage vessels, trips, and ingestion workflows.</p>
        </header>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={submit} className="surface surface--tight form">
          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="form-actions">
            <button className="button button--primary" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}