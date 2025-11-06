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
    <section className="page">
      <div className="stack-lg">
        <header className="page-header">
          <h2 className="page-title">Welcome to AquaMetric</h2>
          <p className="page-subtitle">Stay in sync with your fleet — follow the quick start checklist below.</p>
        </header>

      <div className="tile-grid">
          <article className="surface surface--interactive stack-sm">
            <span className="badge">Step 1</span>
            <h3>Register a vessel</h3>
            <p className="text-muted">Link a fishing vessel to your organisation to unlock trip logging.</p>
            <Link to="/vessels/new" className="button button--primary">Register vessel</Link>
          </article>

          <article className="surface surface--interactive stack-sm">
            <span className="badge">Step 2</span>
            <h3>Create a trip</h3>
            <p className="text-muted">Choose a vessel and set departure and return details for your next voyage.</p>
            <Link to="/trips/new" className="button button--primary">Create trip</Link>
          </article>

          <article className="surface surface--interactive stack-sm">
            <span className="badge">Step 3</span>
            <h3>Upload CSV data</h3>
            <p className="text-muted">Ingest MPI e-log data to populate catches, species, and trip metadata.</p>
            <Link to="/csvingestion/new" className="button button--primary">Upload CSV</Link>
          </article>
        </div>
      </div>

      <div className="stack-md">
          <div className="cluster cluster--spread">
            <h3>Your vessels</h3>
            <button className="button button--ghost button--sm" onClick={fetchVessels} disabled={loading}>
              Refresh
            </button>
          </div>
          {err && <div className="alert alert--error">{err}</div>}
          {loading ? <div className="surface surface--muted">Loading vessels…</div> : <VesselTable rows={rows} />}
        </div>
        
        <TripsTable />
    </section>
  );
}