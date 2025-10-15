import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listTripsByUser, type TripReadDto } from "../services/trips";
import { ingestTripCsv } from "../services/ingestion";
import "../App.css"; // reuse the nice styles

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
    <div className="trip-create">
      <div className="tc-container">
        <h1>CSV Ingestion</h1>

        {error && <div className="tc-alert">{error}</div>}

        <form className="tc-card" onSubmit={handleSubmit}>
          <div className="tc-field">
            <label>Fishing Trip</label>
            <select value={tripId || 0} onChange={(e) => setTripId(Number(e.target.value))}>
              <option value={0}>Select a trip…</option>
              {trips.map(t => (
                <option key={t.fishingTripId} value={t.fishingTripId}>
                  #{t.fishingTripId} — {t.departureDateTime
                    ? new Date(t.departureDateTime).toLocaleString()
                    : "No departure"} ({t.fishingVesselName ?? `Vessel #${t.fishingVesselId}`})
                </option>
              ))}
            </select>
          </div>

          <div className="tc-field">
            <label>CSV file</label>
            <input type="file" accept=".csv,text/csv" onChange={onPickFile} />
            {file && (
              <div className="text-sm text-gray-500">
                Selected: <strong>{file.name}</strong> ({Math.ceil(file.size / 1024)} KB)
              </div>
            )}
            <small className="text-gray-500">
              Expected headers: <code>FishingTrip.*</code>, <code>Catch.*</code>, <code>CatchSpecies.*</code>, <code>CatchMetaData.*</code>
            </small>
          </div>

          <div className="tc-actions">
            <button className="btn btn-primary" type="submit" disabled={busy || !tripId || !file}>
              {busy ? "Uploading…" : "Submit"}
            </button>
            <button className="btn" type="button" onClick={() => navigate(-1)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>

        {success && (
          <div className="tc-card" style={{ marginTop: 16 }}>
            Ingestion complete ✅ — Trip #{success.fishingTripId}, Catch #{success.catchId}.
            <div className="tc-actions" style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
              <button className="btn" onClick={() => setSuccess(null)}>Upload another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}