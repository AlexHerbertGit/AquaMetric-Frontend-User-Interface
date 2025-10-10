import type { VesselReadDto } from "../types/vessel";

export default function VesselTable({ rows }: { rows: VesselReadDto[] }) {
  if (!rows.length) return <div className="card">No vessels found.</div>;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>OrganizationId</th>
              <th>Name</th>
              <th>Registration #</th>
              <th>Owner</th>
              <th>Home Port</th>
              <th>Vessel Type</th>
              <th>Max Capacity (kg)</th>
              <th>Gear Types Used</th>
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
                <td>{v.ownerName ?? "-"}</td>
                <td>{v.homePort ?? "-"}</td>
                <td>{v.vesselType ?? "-"}</td>
                <td>{v.maxCapacityKg ?? "-"}</td>
                <td>{v.gearTypesUsed ?? "-"}</td>
                <td>{v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}