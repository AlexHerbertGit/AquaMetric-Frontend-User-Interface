// src/pages/TripCreate.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createTrip } from "../services/trips";
import { listVesselsByOrg } from "../services/vessels";
import { Link, useNavigate } from "react-router-dom";


type VesselReadDto = {
  fishingVesselId: number;
  fishingVesselName: string;
};

function toIsoUtc(datetimeLocal: string): string {
  return datetimeLocal ? new Date(datetimeLocal).toISOString() : "";
}

function calcDaysAtSea(depLocal: string, retLocal: string): number {
  if (!depLocal || !retLocal) return 0;
  const dep = new Date(depLocal).getTime();
  const ret = new Date(retLocal).getTime();
  if (isNaN(dep) || isNaN(ret) || ret <= dep) return 0;
  const ms = ret - dep;
  const days = ms / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.ceil(days));
}

function calcAverageSpeedKmh(
  totalDistanceKm: number,
  depLocal: string,
  retLocal: string,
  daysAtSea: number
): number {
  if (!totalDistanceKm || totalDistanceKm <= 0) return 0;
  const depMs = new Date(depLocal).getTime();
  const retMs = new Date(retLocal).getTime();
  const hoursFromTimestamps =
    Number.isFinite(depMs) && Number.isFinite(retMs) && retMs > depMs
      ? (retMs - depMs) / 3_600_000
      : null;
  const hours =
    hoursFromTimestamps && hoursFromTimestamps > 0
      ? hoursFromTimestamps
      : Math.max(0, daysAtSea) * 24;
  if (!hours) return 0;
  return Math.round((totalDistanceKm / hours) * 10) / 10;
}

export default function TripCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vessels, setVessels] = useState<VesselReadDto[]>([]);
  const [loadingVessels, setLoadingVessels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);

  // Form fields
  const [fishingVesselId, setFishingVesselId] = useState<number>(0);
  const [departureLocal, setDepartureLocal] = useState<string>("");
  const [returnLocal, setReturnLocal] = useState<string>("");
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Derived
  const [daysAtSea, setDaysAtSea] = useState<number>(0);
  useEffect(() => {
    setDaysAtSea(calcDaysAtSea(departureLocal, returnLocal));
  }, [departureLocal, returnLocal]);

  // Load vessels
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!user?.organizationId) {
        setVessels([]);
        return;
      }
      setLoadingVessels(true);
      setError(null);
      try {
        const data = await listVesselsByOrg(user.organizationId);
        if (ignore) return;
        setVessels(data ?? []);
        if ((data?.length ?? 0) === 1) {
          setFishingVesselId(data![0].fishingVesselId);
        }
      } catch (e: any) {
        if (ignore) return;
        setError("Failed to load vessels. Try refreshing the page.");
        console.error(e);
      } finally {
        if (!ignore) setLoadingVessels(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user?.organizationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user?.userId) {
      setError("You must be logged in.");
      return;
    }
    if (!fishingVesselId || fishingVesselId <= 0) {
      setError("Please select a fishing vessel.");
      return;
    }
    if (!departureLocal || !returnLocal) {
      setError("Please enter both departure and return date/time.");
      return;
    }
    if (daysAtSea <= 0) {
      setError("Return time must be after departure time.");
      return;
    }
    if (!totalDistanceKm || totalDistanceKm <= 0) {
      setError("Please enter a total distance in kilometers greater than 0.");
      return;
    }

    const departureDateTime = toIsoUtc(departureLocal);
    const returnDateTime = toIsoUtc(returnLocal);
    const averageSpeedKmh = calcAverageSpeedKmh(
      totalDistanceKm,
      departureLocal,
      returnLocal,
      daysAtSea
    );

    const payload = {
      fishingVesselId,
      userId: user.userId,
      departureDateTime,
      returnDateTime,
      totalDistanceKm,
      daysAtSea,
      averageSpeedKmh,
      notes: notes?.trim() || undefined,
    };

    try {
      setSubmitBusy(true);
      await createTrip(payload);
      navigate("/dashboard");
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.response?.data ??
        "Trip creation failed. Please check your inputs and try again.";
      setError(String(msg));
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <section className="page page--narrow">
      <div className="stack-lg">
        <header className="page-header">
          <h1 className="page-title">Create fishing trip</h1>
          <p className="page-subtitle">Define the vessel, timing, and distance to log a new voyage.</p>
        </header>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="surface surface--tight form">
          <div className="field">
            <span className="field__label">Fishing vessel</span>
            <select
              value={fishingVesselId}
              onChange={(e) => setFishingVesselId(Number(e.target.value))}
              disabled={loadingVessels}
              required
            >
              <option value={0}>
                {loadingVessels ? "Loading vessels…" : "Select a vessel…"}
              </option>
              {vessels.map((v) => (
                <option key={v.fishingVesselId} value={v.fishingVesselId}>
                  {v.fishingVesselName} (ID {v.fishingVesselId})
                </option>
              ))}
            </select>
            <span className="field__hint">
                No vessels found for your organisation. <Link to="/vessels/new">Create one</Link> and return here.
            </span>
            
          </div>

           <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field__label">Departure (local)</span>
              <input
                type="datetime-local"
                value={departureLocal}
                onChange={(e) => setDepartureLocal(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Return (local)</span>
              <input
                type="datetime-local"
                value={returnLocal}
                onChange={(e) => setReturnLocal(e.target.value)}
              />
            </label>
          </div>

          <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field__label">Days at sea (auto)</span>
              <input type="number" value={daysAtSea} readOnly />
            </label>

            <label className="field">
              <span className="field__label">Total distance (km)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={totalDistanceKm}
                onChange={(e) => setTotalDistanceKm(Number(e.target.value))}
                placeholder="e.g. 123.4"
                required
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional trip context, crew details, weather notes…"
            />
          <span className="field__hint">Optional</span>
          </label>

          <div className="form-actions">
            <button
              type="submit"
               className="button button--primary"
              disabled={
                submitBusy ||
                !fishingVesselId ||
                daysAtSea <= 0 ||
                !totalDistanceKm ||
                totalDistanceKm <= 0
              }
            >
              {submitBusy ? "Creating…" : "Create trip"}
            </button>

            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>

        <details className="surface surface--muted">
          <summary>Show UTC payload preview</summary>
          <pre>
            {JSON.stringify(
              {
                fishingVesselId,
                userId: user?.userId ?? 0,
                departureDateTime: toIsoUtc(departureLocal),
                returnDateTime: toIsoUtc(returnLocal),
                totalDistanceKm,
                daysAtSea,
                averageSpeedKmh: calcAverageSpeedKmh(
                  totalDistanceKm,
                  departureLocal,
                  returnLocal,
                  daysAtSea
                ),
                notes: notes?.trim() || undefined,
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </section>
  );
}