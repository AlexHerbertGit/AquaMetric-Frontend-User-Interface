import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVessel } from "../services/vessels";
import { useAuth } from "../context/AuthContext";

type FormState = {
  fishingVesselName: string;
  fishingVesselRegistrationNumber: string;
  ownerName: string;
  homePort: string;
  vesselType: string;
  maxCapacityKg: number;  // keep string to match API; convert if you switch API to numeric
  gearTypesUsed: string;
};

export default function VesselCreate() {
  const nav = useNavigate();
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 0;

  const [form, setForm] = useState<FormState>({
    fishingVesselName: "",
    fishingVesselRegistrationNumber: "",
    ownerName: "",
    homePort: "",
    vesselType: "",
    maxCapacityKg: 0,
    gearTypesUsed: ""
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!orgId) return setError("No organization selected for this user.");
    if (!form.fishingVesselName.trim()) return setError("Vessel name is required.");
    if (!form.fishingVesselRegistrationNumber.trim()) return setError("Registration number is required.");

    setBusy(true);
    try {
      const created = await createVessel({
        organizationId: orgId,
        fishingVesselName: form.fishingVesselName.trim(),
        fishingVesselRegistrationNumber: form.fishingVesselRegistrationNumber.trim(),
        ownerName: form.ownerName.trim() || undefined,
        homePort: form.homePort.trim() || undefined,
        vesselType: form.vesselType.trim() || undefined,
        maxCapacityKg: form.maxCapacityKg,
        gearTypesUsed: form.gearTypesUsed.trim() || undefined
      });

      setSuccess(`Vessel “${created.fishingVesselName}” created (ID ${created.fishingVesselId}).`);
      setTimeout(() => nav("/vessels/list"), 600);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create vessel.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page page--narrow">
      <div className="stack-lg">
        <header className="page-header">
          <h2 className="page-title">Register a fishing vessel</h2>
          <p className="page-subtitle">Capture the key attributes of a vessel to connect it with your organisation.</p>
        </header>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <form className="surface surface--tight form" onSubmit={submit}>
          <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field__label">Vessel name *</span>
              <input
                placeholder="e.g. FV Moana"
                value={form.fishingVesselName}
                onChange={update("fishingVesselName")}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Registration number *</span>
              <input
                placeholder="NZ-12345"
                value={form.fishingVesselRegistrationNumber}
                onChange={update("fishingVesselRegistrationNumber")}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Owner name</span>
              <input placeholder="Optional" value={form.ownerName} onChange={update("ownerName")} />
            </label>
            <label className="field">
              <span className="field__label">Home port</span>
              <input placeholder="Optional" value={form.homePort} onChange={update("homePort")} />
            </label>
            <label className="field">
              <span className="field__label">Vessel type</span>
              <input placeholder="Optional" value={form.vesselType} onChange={update("vesselType")} />
            </label>
            <label className="field">
              <span className="field__label">Max capacity (kg)</span>
              <input placeholder="Optional" value={form.maxCapacityKg} onChange={update("maxCapacityKg")} />
            </label>
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span className="field__label">Gear types used</span>
              <input placeholder="Optional" value={form.gearTypesUsed} onChange={update("gearTypesUsed")} />
            </label>
          </div>

          <div className="form-actions">
            <button className="button button--primary" disabled={busy}>
              {busy ? "Saving…" : "Create vessel"}
            </button>
            <button className="button button--ghost" type="button" onClick={() => nav(-1)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}