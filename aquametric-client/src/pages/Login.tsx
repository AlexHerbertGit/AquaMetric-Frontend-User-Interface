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
    <div className="container">
      <h2 className="title">Log in</h2>
      <form onSubmit={submit} className="form">
        <input type="email" placeholder="Email" value={form.email}
               onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password}
               onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button className="btn" disabled={busy}>{busy ? "Logging in..." : "Log In"}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}