import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listVesselsByOrg } from "../services/vessels";
import type { VesselReadDto } from "../types/vessel";
import VesselTable from "../components/VesselTable";
import TripsTable from "../components/TripsTable";

export default function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<VesselReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function fetchVessels() {
    if (!user?.organizationId) { setRows([]); setLoading(false); return; }
    setLoading(true); setErr(null);
    try {
      const data = await listVesselsByOrg(user.organizationId!);
      setRows(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to load vessels.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchVessels(); }, [user?.organizationId]);

  return (
    <div className="container stack-md">
      <h2 className="title">Welcome to AquaMetric</h2>
      <p>Next steps:</p>

      <div className="card-grid">
        <div className="card">
          <h3>1) Register a Vessel</h3>
          <p>Link a fishing vessel to your organization.</p>
          <Link to="/vessels/new" className="btn">Register Vessel</Link>
        </div>
        <div className="card">
          <h3>2) Create a Trip</h3>
          <p>Choose a vessel and set your departure/return.</p>
          <Link to="/trips/new" className="btn">Create Trip</Link>
        </div>
        <div className="card">
          <h3>3) Upload CSV</h3>
          <p>Ingest MPI e-log data for your trip.</p>
          <Link to="/ingestion" className="btn">Upload CSV</Link>
        </div>
      </div>

      <div className="stack-md">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <h3 className="title" style={{ margin: 0 }}>Your Vessels</h3>
          <button className="btn" onClick={fetchVessels} disabled={loading}>Refresh</button>
        </div>
        {err && <div className="error">{err}</div>}
        {loading ? <div className="card">Loading vessels…</div> : <VesselTable rows={rows} />}
      </div>
      <div className="card">
        <TripsTable />
      </div>
    </div>
  );
}