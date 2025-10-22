import { useEffect, useState } from "react";
import { listVesselsByOrg } from "../services/vessels";
import { useAuth } from "../context/AuthContext";
import type { VesselReadDto } from "../types/vessel";

export default function VesselList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<VesselReadDto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const orgId = user?.organizationId;

  useEffect(() => {
    if (!orgId) {                  // ✅ guard undefined
      setRows([]);
      return;
    }
    (async () => {
      try {
        const data = await listVesselsByOrg(orgId);  // ✅ orgId is a number here
        setRows(data);
      } catch (e: any) {
        setErr(e?.response?.data?.message ?? "Failed to load vessels.");
      }
    })();
  }, [orgId]);

  return (
    <section className="page">
      <div className="stack-lg">
        <header className="page-header">
          <h2 className="page-title">Registered vessels</h2>
          <p className="page-subtitle">All vessels connected to your organisation are listed below.</p>
        </header>
        {err && <div className="alert alert--error">{err}</div>}
        <div className="surface surface--tight">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registration #</th>
                  <th>Owner</th>
                  <th>Home port</th>
                  <th>Max capacity (kg)</th>
                  <th>Gear types</th>
                </tr>
               </thead>
              <tbody>
                {rows.map(v => (
                  <tr key={v.fishingVesselId}>
                    <td>{v.fishingVesselName}</td>
                    <td>{v.fishingVesselRegistrationNumber}</td>
                    <td>{v.ownerName ?? "—"}</td>
                    <td>{v.homePort ?? "—"}</td>
                    <td>{v.maxCapacityKg ?? "—"}</td>
                    <td>{v.gearTypesUsed ?? "—"}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="table-empty">No vessels found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}