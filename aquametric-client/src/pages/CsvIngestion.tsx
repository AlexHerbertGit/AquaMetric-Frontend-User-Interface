import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listTripsByUser, type TripReadDto } from "../services/trips";
import { ingestTripCsv } from "../services/ingestion";
 

export default function CsvIngestion() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();

  const [trips, setTrips] = useState<TripReadDto[]>([]);
  const [tripId, setTripId] = useState<number>(Number(params.get("tripId") || 0));
  const [file, setFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ fishingTripId: number; catchId: number } | null>(null);

  // Load user trips
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!user?.userId) return;
      try {
        const data = await listTripsByUser(user.userId);
        if (ignore) return;
        setTrips(data ?? []);
        // If a trip was passed in the URL, keep it; else default to last/newest
        if (!tripId && (data?.length ?? 0) > 0) {
          setTripId(data[data.length - 1].fishingTripId);
        }
      } catch (e) {
        console.error(e);
        if (!ignore) setError("Failed to load your trips.");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user?.userId]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.currentTarget.files?.[0] ?? null;
    e.currentTarget.value = "";
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!tripId) { setError("Please select a trip."); return; }
    if (!file)   { setError("Please choose a CSV file."); return; }
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv")) { setError("File must be a .csv"); return; }

    try {
      setBusy(true);
      const res = await ingestTripCsv(tripId, file);
      setSuccess({ fishingTripId: res.fishingTripId, catchId: res.catchId });
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? "Ingestion failed.";
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page page--narrow">
      <div className="stack-lg">
        <header className="page-header">
          <h1 className="page-title">CSV ingestion</h1>
          <p className="page-subtitle">Upload an MPI e-log CSV to populate catches, species, and metadata for a trip.</p>
        </header>

        {error && <div className="alert alert--error">{error}</div>}

        <form className="surface surface--tight form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Fishing trip</span>
            <select value={tripId || 0} onChange={(e) => setTripId(Number(e.target.value))} required>
              <option value={0}>Select a trip…</option>
              {trips.map(t => (
                <option key={t.fishingTripId} value={t.fishingTripId}>
                  #{t.fishingTripId} — {t.departureDateTime
                    ? new Date(t.departureDateTime).toLocaleString()
                    : "No departure"} ({t.fishingVesselName ?? `Vessel #${t.fishingVesselId}`})
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">CSV file</span>
            <input type="file" accept=".csv,text/csv" onChange={onPickFile} />
            {file && (
              <span className="field__hint">
                Selected: <strong>{file.name}</strong> ({Math.ceil(file.size / 1024)} KB)
              </span>
            )}
             <span className="field__hint">
              Expected headers: <code>FishingTrip.*</code>, <code>Catch.*</code>, <code>CatchSpecies.*</code>, <code>CatchMetaData.*</code>
            </span>
          </label>

          <div className="form-actions">
            <button className="button button--primary" type="submit" disabled={busy || !tripId || !file}>
              {busy ? "Uploading…" : "Submit"}
            </button>
            <button className="button button--ghost" type="button" onClick={() => navigate(-1)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>

        {success && (
          <div className="alert alert--success">
            Ingestion complete ✅ — Trip #{success.fishingTripId}, Catch #{success.catchId}.
            <div className="form-actions" style={{ marginTop: "var(--space-3)" }}>
              <button className="button button--ghost" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
              <button className="button button--primary" onClick={() => setSuccess(null)}>Upload another</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}