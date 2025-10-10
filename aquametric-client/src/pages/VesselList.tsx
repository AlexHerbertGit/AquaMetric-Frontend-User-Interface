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
    <div className="container">
      <h2 className="title">Vessels</h2>
      {err && <div className="error">{err}</div>}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Registration #</th>
                <th>Owner</th>
                <th>Home Port</th>
                <th>Max Capacity (kg)</th>
                <th>Gear Types Used</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(v => (
                <tr key={v.fishingVesselId}>
                  <td>{v.fishingVesselName}</td>
                  <td>{v.fishingVesselRegistrationNumber}</td>
                  <td>{v.ownerName ?? "-"}</td>
                  <td>{v.homePort ?? "-"}</td>
                  <td>{v.maxCapacityKg ?? "-"}</td>
                  <td>{v.gearTypesUsed ?? "-"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6}>No vessels found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}