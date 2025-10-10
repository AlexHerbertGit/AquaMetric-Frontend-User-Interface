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
    <div className="container">
      <h2 className="title">Create your account</h2>

      <div className="segmented">
        <button type="button" className={`segmented__btn ${mode === "join" ? "is-active" : ""}`} onClick={() => setMode("join")}>Join existing org</button>
        <button type="button" className={`segmented__btn ${mode === "create" ? "is-active" : ""}`} onClick={() => setMode("create")}>Create new org</button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {mode === "join" ? (
          <label className="form-group">
            <span>Organization</span>
            <select
              value={organizationId ?? ""}
              onChange={(e) => setOrganizationId(Number(e.target.value) || null)}
              required
            >
              <option value="">Select organization…</option>
              {orgs.map(o => (
                <option key={o.organizationId} value={o.organizationId}>{o.organizationName}</option>
              ))}
            </select>
          </label>
        ) : (
          <div className="card">
            <div className="grid">
              <input placeholder="Organization name" value={orgCreate.organizationName}
                     onChange={e => setOrgCreate({ ...orgCreate, organizationName: e.target.value })} required />
              <input placeholder="Industry type" value={orgCreate.industryType}
                     onChange={e => setOrgCreate({ ...orgCreate, industryType: e.target.value })} />
              <input placeholder="Org email (optional)" value={orgCreate.email}
                     onChange={e => setOrgCreate({ ...orgCreate, email: e.target.value })} />
              <input placeholder="Phone (optional)" value={orgCreate.phoneNumber}
                     onChange={e => setOrgCreate({ ...orgCreate, phoneNumber: e.target.value })} />
              <input placeholder="Address (optional)" value={orgCreate.address}
                     onChange={e => setOrgCreate({ ...orgCreate, address: e.target.value })} />
            </div>
          </div>
        )}

        <div className="grid">
          <input placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <input placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <input type="password" placeholder="Confirm password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
        </div>

        <button className="btn" disabled={busy}>{busy ? "Creating account..." : "Register"}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}