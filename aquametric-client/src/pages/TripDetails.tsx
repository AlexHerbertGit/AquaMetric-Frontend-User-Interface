import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getCatchesForTrip,
  getTripById,
  type CatchReadDto,
  type CatchSpeciesReadDto,
  type TripReadDto,
} from "../services/trips";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const t = Date.parse(d);
  if (Number.isNaN(t)) return d;
  return new Date(t).toLocaleString();
}

function fmtNum(n?: number | null, digits = 1) {
  if (n == null) return "—";
  const f = new Intl.NumberFormat(undefined, { maximumFractionDigits: digits });
  return f.format(n);
}

function fmtBool(v?: boolean | null) {
  if (v == null) return "—";
  return v ? "Yes" : "No";
}

export default function TripDetails() {
  const { tripId } = useParams();
  const numericTripId = useMemo(() => Number(tripId), [tripId]);
  const [trip, setTrip] = useState<TripReadDto | null>(null);
  const [catches, setCatches] = useState<CatchReadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(numericTripId)) {
      setError("Invalid trip identifier provided.");
      setLoading(false);
      return;
    }

    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      setTrip(null);
      setCatches([]);
      try {
        const [tripData, catchRows] = await Promise.all([
          getTripById(numericTripId),
          getCatchesForTrip(numericTripId),
        ]);
        if (ignore) return;
        setTrip(tripData ?? null);
        setCatches(catchRows ?? []);
      } catch (e) {
        if (ignore) return;
        console.error(e);
        setError("Failed to load trip details.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [numericTripId]);

  const hasTrip = trip != null;
  const vesselLabel = hasTrip
    ? trip.fishingVesselName ?? `Vessel #${trip.fishingVesselId}`
    : "Trip";

  return (
    <section className="page">
      <div className="stack-lg">
        <header className="page-header stack-sm">
          <div className="cluster cluster--gap-sm">
            <Link className="button button--ghost button--sm" to="/dashboard">
              ← Back to dashboard
            </Link>
            <span className="badge">Trip #{tripId}</span>
          </div>
          <h2 className="page-title">{vesselLabel}</h2>
          {hasTrip && (
            <p className="page-subtitle">
              {trip.clientNumber ? `Client #${trip.clientNumber} · ` : ""}
              {fmtDate(trip.departureDateTime)} → {fmtDate(trip.returnDateTime)}
            </p>
          )}
        </header>

        {loading && <div className="surface surface--muted">Loading trip…</div>}
        {error && <div className="alert alert--error">{error}</div>}
        {!loading && !error && !hasTrip && (
          <div className="surface surface--muted">Trip was not found.</div>
        )}

        {hasTrip && !loading && !error && (
          <div className="stack-lg">
            <div className="details-grid">
              <section className="surface surface--muted surface--tight stack-sm">
                <h3>Voyage summary</h3>
                <div className="definition-grid text-small">
                  <span className="definition-grid__label">Departure</span>
                  <span>{fmtDate(trip.departureDateTime)}</span>
                  <span className="definition-grid__label">Return</span>
                  <span>{fmtDate(trip.returnDateTime)}</span>
                  <span className="definition-grid__label">Days at sea</span>
                  <span>{fmtNum(trip.daysAtSea, 0)}</span>
                  <span className="definition-grid__label">Distance (km)</span>
                  <span>{fmtNum(trip.totalDistanceKm)}</span>
                  <span className="definition-grid__label">Avg speed (km/h)</span>
                  <span>{fmtNum(trip.averageSpeedKmh)}</span>
                </div>
                <div className="definition-grid text-small">
                  <span className="definition-grid__label">Landing port</span>
                  <span>
                    {trip.landingPortCode ?? "—"} {trip.landingCode ? `(${trip.landingCode})` : ""}
                  </span>
                  <span className="definition-grid__label">Master / Fisher</span>
                  <span>{trip.masterOrFisherName ?? "—"}</span>
                  <span className="definition-grid__label">Vessel used</span>
                  <span>{fmtBool(trip.isVesselUsed)}</span>
                </div>
              </section>

              <section className="surface surface--muted surface--tight stack-sm">
                <h3>Coordinates</h3>
                <div className="mono-block text-small">
                  Start: {fmtNum(trip.startLatitude, 5)}, {fmtNum(trip.startLongitude, 5)}
                  <br />
                  End: {fmtNum(trip.endLatitude, 5)}, {fmtNum(trip.endLongitude, 5)}
                </div>
              </section>

              <section className="surface surface--muted surface--tight stack-sm">
                <h3>Notes</h3>
                <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
                  {trip.notes?.trim() ? trip.notes : "No notes provided."}
                </div>
              </section>
            </div>

            <section className="stack-md">
              <div className="cluster cluster--spread cluster--baseline">
                <h3 className="stack-xs">Catch details</h3>
                <span className="text-small text-muted">
                  {catches.length} {catches.length === 1 ? "recorded catch" : "recorded catches"}
                </span>
              </div>

              {catches.length === 0 ? (
                <div className="surface surface--muted">No catches recorded for this trip.</div>
              ) : (
                <div className="stack-md">
                  {catches.map((catchRow) => (
                    <CatchCard key={catchRow.catchId} catchRow={catchRow} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

function CatchCard({ catchRow }: { catchRow: CatchReadDto }) {
  const md = catchRow.metaData ?? null;
  const species = catchRow.species ?? [];

  return (
    <article className="surface surface--muted surface--tight stack-md">
      <div className="cluster cluster--spread cluster--baseline">
        <div className="stack-xs">
          <h4>Catch #{catchRow.catchId}</h4>
          <div className="text-small text-muted">
            {fmtDate(catchRow.startDateTime)} → {fmtDate(catchRow.finishDateTime)}
          </div>
        </div>
        <div className="badge">{catchRow.fishingMethodCode ?? "—"}</div>
      </div>

      <div className="definition-grid text-small">
        <span className="definition-grid__label">Target species</span>
        <span>{catchRow.targetSpeciesCode ?? "—"}</span>
        <span className="definition-grid__label">Total weight (kg)</span>
        <span>{fmtNum(catchRow.totalWeightKg)}</span>
        <span className="definition-grid__label">Statistical area</span>
        <span>{catchRow.statisticalAreaCode ?? "—"}</span>
        <span className="definition-grid__label">NFPS present</span>
        <span>{fmtBool(catchRow.nfpsPresent)}</span>
      </div>

      <section className="stack-sm">
        <h5 className="text-small text-muted">Environmental metadata</h5>
        {!md ? (
          <div className="text-small text-muted">No metadata captured.</div>
        ) : (
          <div className="definition-grid text-small">
            <span className="definition-grid__label">Water temp (°C)</span>
            <span>{fmtNum(md.waterTempC)}</span>
            <span className="definition-grid__label">Catch depth (m)</span>
            <span>{fmtNum(md.catchDepthM)}</span>
            <span className="definition-grid__label">Visibility (m)</span>
            <span>{fmtNum(md.visibilityM)}</span>
            <span className="definition-grid__label">Bottom depth (m)</span>
            <span>{fmtNum(md.bottomDepthMetres)}</span>
            <span className="definition-grid__label">Chl-a (µg/L)</span>
            <span>{fmtNum(md.chlorophyllAUgL, 3)}</span>
            <span className="definition-grid__label">Phyto cells (/L)</span>
            <span>{fmtNum(md.phytoCellsPerL, 0)}</span>
            <span className="definition-grid__label">Average hooks/line</span>
            <span>{fmtNum(md.averageHooksPerLine, 0)}</span>
            <span className="definition-grid__label">Hooks number</span>
            <span>{fmtNum(md.hooksNumber, 0)}</span>
            <span className="definition-grid__label">Lines / hauls</span>
            <span>{fmtNum(md.linesHaulsCount, 0)}</span>
            <span className="definition-grid__label">Gear type</span>
            <span>{md.gearType ?? "—"}</span>
            <span className="definition-grid__label">Mitigation</span>
            <span>{md.mitigationDeviceCode ?? "—"}</span>
          </div>
        )}
      </section>

      <section className="stack-sm">
        <h5 className="text-small text-muted">Species breakdown</h5>
        {species.length === 0 ? (
          <div className="text-small text-muted">No species rows.</div>
        ) : (
          <div className="table-container">
            <table className="data-table data-table--dense">
              <thead>
                <tr>
                  <th>Species ID</th>
                  <th>Quantity</th>
                  <th>Avg length (cm)</th>
                  <th>Green weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {species.map((row: CatchSpeciesReadDto) => (
                  <tr key={row.catchSpeciesId}>
                    <td>{row.fishSpeciesId}</td>
                    <td>{fmtNum(row.quantity, 0)}</td>
                    <td>{fmtNum(row.avgLengthCm, 1)}</td>
                    <td>{fmtNum(row.greenweightKg, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </article>
  );
}