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
    <div className="container">
      <h2 className="title">Register a Fishing Vessel</h2>
      <form className="form" onSubmit={submit}>
        <div className="grid">
          <input
            placeholder="Vessel name *"
            value={form.fishingVesselName}
            onChange={update("fishingVesselName")}
            required
          />
          <input
            placeholder="Registration number *"
            value={form.fishingVesselRegistrationNumber}
            onChange={update("fishingVesselRegistrationNumber")}
            required
          />
          <input placeholder="Owner name" value={form.ownerName} onChange={update("ownerName")} />
          <input placeholder="Home port" value={form.homePort} onChange={update("homePort")} />
          <input placeholder="Vessel type" value={form.vesselType} onChange={update("vesselType")} />
          <input placeholder="Max capacity (kg)" value={form.maxCapacityKg} onChange={update("maxCapacityKg")} />
          <input placeholder="Gear types used" value={form.gearTypesUsed} onChange={update("gearTypesUsed")} />
        </div>

        <button className="btn" disabled={busy}>{busy ? "Saving..." : "Create Vessel"}</button>
        {error && <div className="error">{error}</div>}
        {success && <div className="card">{success}</div>}
      </form>
    </div>
  );
}