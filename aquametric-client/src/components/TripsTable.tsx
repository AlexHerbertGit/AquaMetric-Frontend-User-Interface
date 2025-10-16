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
    <div className="tc-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Your Trips</h2>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>

      {error && <div className="tc-alert">{error}</div>}

      {!loading && !hasData && (
        <div className="text-sm text-gray-600">
          No trips yet. Create one from the “Create Fishing Trip” page.
        </div>
      )}

      {hasData && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-3">Vessel</th>
                <th className="py-2 pr-3">Client #</th>
                <th className="py-2 pr-3">Departure</th>
                <th className="py-2 pr-3">Return</th>
                <th className="py-2 pr-3">Days</th>
                <th className="py-2 pr-3">Distance (km)</th>
                <th className="py-2 pr-3">Avg Speed (km/h)</th>
                <th className="py-2 pr-3">Landing</th>
                <th className="py-2 pr-3">Coords</th>
                <th className="py-2 pr-3"></th>
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
    </div>
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
      <tr className="border-t border-gray-200">
        <td className="py-2 pr-3">{trip.fishingVesselName ?? `Vessel #${trip.fishingVesselId}`}</td>
        <td className="py-2 pr-3">{trip.clientNumber ?? "—"}</td>
        <td className="py-2 pr-3">{fmtDate(trip.departureDateTime)}</td>
        <td className="py-2 pr-3">{fmtDate(trip.returnDateTime)}</td>
        <td className="py-2 pr-3">{fmtNum(trip.daysAtSea, 0)}</td>
        <td className="py-2 pr-3">{fmtNum(trip.totalDistanceKm)}</td>
        <td className="py-2 pr-3">{fmtNum(trip.averageSpeedKmh)}</td>
        <td className="py-2 pr-3">
          {trip.landingPortCode ?? "—"} {trip.landingCode ? `(${trip.landingCode})` : ""}
        </td>
        <td className="py-2 pr-3">{coords}</td>
        <td className="py-2 pr-0">
          <button className="btn" onClick={onToggle}>
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="border-t border-gray-100">
          <td colSpan={10} className="py-3">
            {loadingDetails ? (
              <div className="text-sm text-gray-500">Loading details…</div>
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
    <div className="grid gap-3 md:grid-cols-3">
      <div className="tc-card">
        <div className="text-xs text-gray-500 mb-1">Master / Fisher</div>
        <div className="font-medium">{trip.masterOrFisherName ?? "—"}</div>
        <div className="text-xs text-gray-500 mt-3">Vessel Used</div>
        <div>{trip.isVesselUsed ? "Yes" : "No"}</div>
        <div className="text-xs text-gray-500 mt-3">Notes</div>
        <div className="whitespace-pre-wrap">{trip.notes ?? "—"}</div>
      </div>

      <div className="tc-card">
        <div className="text-xs text-gray-500 mb-1">Trip Coordinates</div>
        <div className="font-mono text-xs">
          Start: {fmtNum(trip.startLatitude, 5)}, {fmtNum(trip.startLongitude, 5)}
        </div>
        <div className="font-mono text-xs">
          End: {fmtNum(trip.endLatitude, 5)}, {fmtNum(trip.endLongitude, 5)}
        </div>
      </div>

      <div className="tc-card">
        <div className="text-xs text-gray-500 mb-1">Catches</div>
        {catches.length === 0 ? (
          <div className="text-sm text-gray-600">No catches (yet).</div>
        ) : (
          <ul className="text-sm space-y-4">
            {catches.map((c) => {
              const md = metaByCatch[c.catchId]?.[0]; // one metadata row per catch
              const sp = speciesByCatch[c.catchId] ?? [];
              return (
                <li key={c.catchId} className="border-b border-gray-200 pb-3">
                  <div className="font-medium">
                    Catch #{c.catchId} — {c.targetSpeciesCode ?? "—"} ({c.fishingMethodCode ?? "—"})
                  </div>
                  <div className="text-xs mb-2">
                    {fmtDate(c.startDateTime)} → {fmtDate(c.finishDateTime)} · Weight: {fmtNum(c.totalWeightKg, 1)} kg
                    {c.nfpsPresent ? " · NFPS present" : ""}
                  </div>

                  {/* Metadata summary */}
                  {!md ? (
                    <div className="text-xs text-gray-600">No metadata.</div>
                  ) : (
                    <div className="text-xs grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <span className="text-gray-500">Water Temp (°C)</span><span>{fmtNum(md.waterTempC)}</span>
                      <span className="text-gray-500">Catch Depth (m)</span><span>{fmtNum(md.catchDepthM)}</span>
                      <span className="text-gray-500">Visibility (m)</span><span>{fmtNum(md.visibilityM)}</span>
                      <span className="text-gray-500">Bottom Depth (m)</span><span>{fmtNum(md.bottomDepthMetres)}</span>
                      <span className="text-gray-500">Chl-a (µg/L)</span><span>{fmtNum(md.chlorophyllAUgL, 3)}</span>
                      <span className="text-gray-500">Phyto Cells (/L)</span><span>{fmtNum(md.phytoCellsPerL, 0)}</span>
                      <span className="text-gray-500">Avg Hooks/Line</span><span>{fmtNum(md.averageHooksPerLine, 0)}</span>
                      <span className="text-gray-500">Hooks Number</span><span>{fmtNum(md.hooksNumber, 0)}</span>
                      <span className="text-gray-500">Lines/Hauls</span><span>{fmtNum(md.linesHaulsCount, 0)}</span>
                      <span className="text-gray-500">Gear</span><span>{md.gearType ?? "—"}</span>
                      <span className="text-gray-500">Mitigation</span><span>{md.mitigationDeviceCode ?? "—"}</span>
                    </div>
                  )}

                  {/* Species table */}
                  {sp.length === 0 ? (
                    <div className="text-xs text-gray-600 mt-2">No species rows.</div>
                  ) : (
                    <div className="overflow-x-auto mt-2">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-1 pr-3">SpeciesId</th>
                            <th className="py-1 pr-3">Qty</th>
                            <th className="py-1 pr-3">Avg Len (cm)</th>
                            <th className="py-1 pr-3">Green Wt (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sp.map((row) => (
                            <tr key={row.catchSpeciesId} className="border-t border-gray-200">
                              <td className="py-1 pr-3">{row.fishSpeciesId}</td>
                              <td className="py-1 pr-3">{fmtNum(row.quantity, 0)}</td>
                              <td className="py-1 pr-3">{fmtNum(row.avgLengthCm, 1)}</td>
                              <td className="py-1 pr-3">{fmtNum(row.greenweightKg, 1)}</td>
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
      </div>
    </div>
  );
}