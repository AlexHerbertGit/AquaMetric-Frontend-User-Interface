import type { VesselReadDto } from "../types/vessel";

export default function VesselTable({ rows }: { rows: VesselReadDto[] }) {
  if (!rows.length) {
    return <div className="surface surface--muted text-muted">No vessels found yet.</div>;
  }

  return (
    <div className="surface surface--tight">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Organization</th>
              <th>Name</th>
              <th>Registration #</th>
              <th>Owner</th>
              <th>Home port</th>
              <th>Vessel type</th>
              <th>Capacity (kg)</th>
              <th>Gear types</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(v => (
              <tr key={v.fishingVesselId}>
                <td>{v.fishingVesselId}</td>
                <td>{v.organizationId}</td>
                <td>{v.fishingVesselName}</td>
                <td>{v.fishingVesselRegistrationNumber}</td>
                <td>{v.ownerName ?? "—"}</td>
                <td>{v.homePort ?? "—"}</td>
                <td>{v.vesselType ?? "—"}</td>
                <td>{v.maxCapacityKg ?? "—"}</td>
                <td>{v.gearTypesUsed ?? "—"}</td>
                <td>{v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}