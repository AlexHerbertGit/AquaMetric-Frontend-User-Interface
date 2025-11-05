import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { listTripsByUser, type TripReadDto } from "../services/trips";

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

export default function TripsTable() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<TripReadDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!user?.userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await listTripsByUser(user.userId);
        if (ignore) return;
        setTrips(data);
      } catch (e: any) {
        if (ignore) return;
        console.error(e);
        setError("Failed to load your trips.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [user?.userId]);

  const hasData = trips.length > 0;

  return (
    <section className="surface surface--tight stack-md">
      <div className="cluster cluster--spread">
        <div className="stack-xs">
          <h3>Recent trips</h3>
          <p className="text-muted text-small">Open a trip to explore catches, species, and metadata.</p>
        </div>
        {loading && <span className="text-subtle text-small">Loading…</span>}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {!loading && !hasData && (
        <div className="text-muted">No trips yet. Create one from the “Create Fishing Trip” page.</div>
      )}

      {hasData && (
        <div className="table-container">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Vessel</th>
                <th>Client #</th>
                <th>Departure</th>
                <th>Return</th>
                <th>Days</th>
                <th>Distance (km)</th>
                <th>Avg speed (km/h)</th>
                <th>Landing</th>
                <th>Coords</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => {
                const coords =
                  t.startLatitude != null && t.startLongitude != null && t.endLatitude != null && t.endLongitude != null
                    ? `${fmtNum(t.startLatitude, 4)}, ${fmtNum(t.startLongitude, 4)} → ${fmtNum(t.endLatitude, 4)}, ${fmtNum(t.endLongitude, 4)}`
                    : "—";

                return (
                  <tr key={t.fishingTripId}>
                    <td>{t.fishingVesselName ?? `Vessel #${t.fishingVesselId}`}</td>
                    <td>{t.clientNumber ?? "—"}</td>
                    <td>{fmtDate(t.departureDateTime)}</td>
                    <td>{fmtDate(t.returnDateTime)}</td>
                    <td>{fmtNum(t.daysAtSea, 0)}</td>
                    <td>{fmtNum(t.totalDistanceKm)}</td>
                    <td>{fmtNum(t.averageSpeedKmh)}</td>
                    <td>
                      {t.landingPortCode ?? "—"} {t.landingCode ? `(${t.landingCode})` : ""}
                    </td>
                    <td className="text-mono text-small">{coords}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link className="button button--ghost button--sm" to={`/trips/${t.fishingTripId}`}>
                        Details
                      </Link>
                    </td>
                  </tr> 
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
