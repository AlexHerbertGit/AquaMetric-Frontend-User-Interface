import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listOrganizations, createOrganization } from "../services/organizations";
import type { OrganizationReadDto } from "../types/org";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [orgs, setOrgs] = useState<OrganizationReadDto[]>([]);
  const [mode, setMode] = useState<"join" | "create">("join");
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [orgCreate, setOrgCreate] = useState({
    organizationName: "",
    industryType: "Fishing",
    email: "",
    phoneNumber: "",
    address: ""
  });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => setOrgs(await listOrganizations()))(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let orgId = organizationId;

    try {
      setBusy(true);

      if (mode === "create") {
        if (!orgCreate.organizationName.trim()) throw new Error("Organization name is required.");
        const created = await createOrganization(orgCreate);
        orgId = created.organizationId;
      }

      if (!orgId) throw new Error("Select or create an Organization.");
      if (!form.email || !form.password) throw new Error("Email and password are required.");
      if (form.password !== form.confirm) throw new Error("Passwords do not match.");

      await register({
        organizationId: orgId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password
      });

      nav("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page page--narrow">
      <div className="stack-lg">
        <header className="page-header">
          <h2 className="page-title">Create your account</h2>
          <p className="page-subtitle">Join an existing organisation or create a new one for your crew.</p>
        </header>

      <div className="segmented">
          <button
            type="button"
            className={`segmented__option ${mode === "join" ? "is-active" : ""}`}
            onClick={() => setMode("join")}
          >
            Join existing org
          </button>
          <button
            type="button"
            className={`segmented__option ${mode === "create" ? "is-active" : ""}`}
            onClick={() => setMode("create")}
          >
            Create new org
          </button>
        </div>

      {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="surface surface--tight form">
          {mode === "join" ? (
            <label className="field">
              <span className="field__label">Organisation</span>
              <select
                value={organizationId ?? ""}
                onChange={(e) => setOrganizationId(Number(e.target.value) || null)}
                required
              >
                <option value="">Select organisation…</option>
                {orgs.map(o => (
                  <option key={o.organizationId} value={o.organizationId}>{o.organizationName}</option>
                ))}
              </select>
            </label>
          ) : (
            <div className="surface surface--muted surface--tight form-grid">
              <label className="field">
                <span className="field__label">Organisation name</span>
                <input
                  placeholder="e.g. Sea Harvest Co."
                  value={orgCreate.organizationName}
                  onChange={e => setOrgCreate({ ...orgCreate, organizationName: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Industry type</span>
                <input
                  placeholder="Fishing"
                  value={orgCreate.industryType}
                  onChange={e => setOrgCreate({ ...orgCreate, industryType: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Organisation email</span>
                <input
                  type="email"
                  placeholder="team@organisation.nz"
                  value={orgCreate.email}
                  onChange={e => setOrgCreate({ ...orgCreate, email: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Phone</span>
                <input
                  placeholder="Optional"
                  value={orgCreate.phoneNumber}
                  onChange={e => setOrgCreate({ ...orgCreate, phoneNumber: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Address</span>
                <input
                  placeholder="Optional"
                  value={orgCreate.address}
                  onChange={e => setOrgCreate({ ...orgCreate, address: e.target.value })}
                />
              </label>
            </div>
          )}

        <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field__label">First name</span>
              <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label className="field">
              <span className="field__label">Last name</span>
              <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
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
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Confirm password</span>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                autoComplete="new-password"
                required
              />
            </label>
          </div>

        <div className="form-actions">
            <button className="button button--primary" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}