import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listTripsByUser, getCatchesForTrip, type CatchReadDto, type CatchMetaDataReadDto, type CatchSpeciesReadDto } from "../services/trips";

type TripReadDto = {
  fishingTripId: number;
  fishingVesselId: number;
  fishingVesselName?: string;

  userId: number;
  clientNumber?: string | null;

  departureDateTime?: string | null; // ISO
  returnDateTime?: string | null;    // ISO

  totalDistanceKm?: number | null;
  daysAtSea?: number | null;
  averageSpeedKmh?: number | null;

  startLatitude?: number | null;
  startLongitude?: number | null;
  endLatitude?: number | null;
  endLongitude?: number | null;

  isVesselUsed?: boolean | null;
  landingPortCode?: string | null;
  landingCode?: string | null;
  masterOrFisherName?: string | null;

  notes?: string | null;
};

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

  // details state (expand-on-demand fetch)
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [catchesByTrip, setCatchesByTrip] = useState<Record<number, CatchReadDto[]>>({});
  const [metaByCatch, setMetaByCatch] = useState<Record<number, CatchMetaDataReadDto[]>>({});
  const [speciesByCatch, setSpeciesByCatch] = useState<Record<number, CatchSpeciesReadDto[]>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  async function toggleExpand(tripId: number) {
    if (expandedId === tripId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(tripId);

    // If we already have catches + details, no need to refetch
    if (catchesByTrip[tripId] && catchesByTrip[tripId].length > 0) return;

    try {
      setLoadingDetails(true);
      const rows = await getCatchesForTrip(tripId);
      setCatchesByTrip((m) => ({ ...m, [tripId]: rows ?? [] }));

      // Fetch metadata & species for all catches in parallel
       for (const c of rows ?? []) {
       setMetaByCatch((m) => ({ ...m, [c.catchId]: c.metaData ? [c.metaData] : [] }));
       setSpeciesByCatch((m) => ({ ...m, [c.catchId]: c.species ?? [] }));
    }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  }

  const hasData = trips.length > 0;

  return (
    <section className="surface surface--tight stack-md">
      <div className="cluster cluster--spread">
        <div className="stack-xs">
          <h3>Recent trips</h3>
          <p className="text-muted text-small">Expand a trip to explore catches, species, and metadata.</p>
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
                  <FragmentRow
                    key={t.fishingTripId}
                    trip={t}
                    coords={coords}
                    expanded={expandedId === t.fishingTripId}
                    onToggle={() => toggleExpand(t.fishingTripId)}
                    catches={catchesByTrip[t.fishingTripId] ?? []}
                    metaByCatch={metaByCatch}
                    speciesByCatch={speciesByCatch}
                    loadingDetails={loadingDetails && expandedId === t.fishingTripId}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FragmentRow({
  trip,
  coords,
  expanded,
  onToggle,
  catches,
  metaByCatch,
  speciesByCatch,
  loadingDetails,
}: {
  trip: TripReadDto;
  coords: string;
  expanded: boolean;
  onToggle: () => void;
  catches: CatchReadDto[];
  metaByCatch: Record<number, CatchMetaDataReadDto[]>;
  speciesByCatch: Record<number, CatchSpeciesReadDto[]>;
  loadingDetails: boolean;
}) {
  return (
    <>
      <tr>
        <td>{trip.fishingVesselName ?? `Vessel #${trip.fishingVesselId}`}</td>
        <td>{trip.clientNumber ?? "—"}</td>
        <td>{fmtDate(trip.departureDateTime)}</td>
        <td>{fmtDate(trip.returnDateTime)}</td>
        <td>{fmtNum(trip.daysAtSea, 0)}</td>
        <td>{fmtNum(trip.totalDistanceKm)}</td>
        <td>{fmtNum(trip.averageSpeedKmh)}</td>
        <td>
          {trip.landingPortCode ?? "—"} {trip.landingCode ? `(${trip.landingCode})` : ""}
        </td>
        <td className="text-mono text-small">{coords}</td>
        <td style={{ textAlign: "right" }}>
          <button className="button button--ghost button--sm" onClick={onToggle}>
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={10}>
            {loadingDetails ? (
              <div className="text-muted text-small">Loading details…</div>
            ) : (
              <TripDetails
                trip={trip}
                catches={catches}
                metaByCatch={metaByCatch}
                speciesByCatch={speciesByCatch}
              />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function TripDetails({
  trip,
  catches,
  metaByCatch,
  speciesByCatch,
}: {
  trip: TripReadDto;
  catches: CatchReadDto[];
  metaByCatch: Record<number, CatchMetaDataReadDto[]>;
  speciesByCatch: Record<number, CatchSpeciesReadDto[]>;
}) {
  return (
    <div className="details-grid">
      <section className="surface surface--muted surface--tight stack-sm">
        <span className="field__label">Master / Fisher</span>
        <div>{trip.masterOrFisherName ?? "—"}</div>
        <span className="field__label">Vessel used</span>
        <div>{trip.isVesselUsed ? "Yes" : "No"}</div>
        <span className="field__label">Notes</span>
        <div className="text-muted" style={{ whiteSpace: "pre-wrap" }}>{trip.notes ?? "—"}</div>
      </section>

      <section className="surface surface--muted surface--tight stack-sm">
        <span className="field__label">Trip coordinates</span>
        <div className="mono-block">
          Start: {fmtNum(trip.startLatitude, 5)}, {fmtNum(trip.startLongitude, 5)}
        <br />
          End: {fmtNum(trip.endLatitude, 5)}, {fmtNum(trip.endLongitude, 5)}
        </div>
      </section>

      <section className="surface surface--muted surface--tight stack-sm">
        <span className="field__label">Catches</span>
        {catches.length === 0 ? (
          <div className="text-muted text-small">No catches recorded.</div>
        ) : (
          <ul className="list-stack">
            {catches.map((c) => {
              const md = metaByCatch[c.catchId]?.[0];
              const sp = speciesByCatch[c.catchId] ?? [];
              return (
                <li key={c.catchId} className="stack-sm">
                  <div className="cluster cluster--spread">
                    <div className="text-small text-muted">Catch #{c.catchId}</div>
                    <div className="badge">{c.fishingMethodCode ?? "—"}</div>
                  </div>
                  <div className="text-small text-muted">
                    {fmtDate(c.startDateTime)} → {fmtDate(c.finishDateTime)} · Weight: {fmtNum(c.totalWeightKg, 1)} kg
                    {c.nfpsPresent ? " · NFPS present" : ""}
                  </div>
                  <div className="text-small">Target species: {c.targetSpeciesCode ?? "—"}</div>

                  
                  {!md ? (
                    <div className="text-small text-muted">No metadata captured.</div>
                  ) : (
                    <div className="definition-grid text-small">
                      <span className="definition-grid__label">Water temp (°C)</span><span>{fmtNum(md.waterTempC)}</span>
                      <span className="definition-grid__label">Catch depth (m)</span><span>{fmtNum(md.catchDepthM)}</span>
                      <span className="definition-grid__label">Visibility (m)</span><span>{fmtNum(md.visibilityM)}</span>
                      <span className="definition-grid__label">Bottom depth (m)</span><span>{fmtNum(md.bottomDepthMetres)}</span>
                      <span className="definition-grid__label">Chl-a (µg/L)</span><span>{fmtNum(md.chlorophyllAUgL, 3)}</span>
                      <span className="definition-grid__label">Phyto cells (/L)</span><span>{fmtNum(md.phytoCellsPerL, 0)}</span>
                      <span className="definition-grid__label">Avg hooks/line</span><span>{fmtNum(md.averageHooksPerLine, 0)}</span>
                      <span className="definition-grid__label">Hooks number</span><span>{fmtNum(md.hooksNumber, 0)}</span>
                      <span className="definition-grid__label">Lines / hauls</span><span>{fmtNum(md.linesHaulsCount, 0)}</span>
                      <span className="definition-grid__label">Gear</span><span>{md.gearType ?? "—"}</span>
                      <span className="definition-grid__label">Mitigation</span><span>{md.mitigationDeviceCode ?? "—"}</span>
                    </div>
                  )}

                  {/* Species table */}
                  {sp.length === 0 ? (
                    <div className="text-small text-muted">No species rows.</div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table data-table--dense">
                        <thead>
                          <tr>
                            <th>SpeciesId</th>
                            <th>Qty</th>
                            <th>Avg len (cm)</th>
                            <th>Green wt (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sp.map((row) => (
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
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}