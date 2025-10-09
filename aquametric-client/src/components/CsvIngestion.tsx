import { useMemo, useState } from "react";
import { commitCsv, previewCsv } from "../services/ingestion";

export default function CsvIngestion() {
  const [file, setFile] = useState<File | null>(null);
  const [fishingTripId, setFishingTripId] = useState<string>("");
  const [vesselId, setVesselId] = useState<string>("");

  const [preview, setPreview] = useState<any>(null);
  const [commitResp, setCommitResp] = useState<any>(null);

  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extras = useMemo(() => {
    const e: { FishingTripId?: number; VesselId?: number } = {};
    if (fishingTripId.trim() !== "") e.FishingTripId = Number(fishingTripId);
    if (vesselId.trim() !== "") e.VesselId = Number(vesselId);
    return e;
  }, [fishingTripId, vesselId]);

  async function handlePreview() {
    if (!file) return;
    setBusy(true); setError(null); setCommitResp(null); setUploadPct(0);
    try {
      const resp = await previewCsv(file, extras, setUploadPct);
      setPreview(resp);
    } catch (e: any) {
      setError(
        e?.response?.data?.errors?.join?.(", ")
          ?? e?.response?.data?.message
          ?? e?.message
          ?? "Preview failed"
      );
    } finally {
      setBusy(false); setUploadPct(null);
    }
  }

  async function handleCommit() {
    if (!file) return;
    setBusy(true); setError(null); setUploadPct(0);
    try {
      const resp = await commitCsv(file, extras, dryRun, setUploadPct);
      setCommitResp(resp);
    } catch (e: any) {
      setError(
        e?.response?.data?.errors?.join?.(", ")
          ?? e?.response?.data?.message
          ?? e?.message
          ?? "Commit failed"
      );
    } finally {
      setBusy(false); setUploadPct(null);
    }
  }

  return (
    <section style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      <h2>CSV Ingestion</h2>

      <div style={{ display: "grid", gap: 8 }}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            FishingTripId:&nbsp;
            <input
              value={fishingTripId}
              onChange={(e) => setFishingTripId(e.target.value)}
              placeholder="(optional)"
              style={{ width: 160 }}
            />
          </label>
          <label>
            VesselId:&nbsp;
            <input
              value={vesselId}
              onChange={(e) => setVesselId(e.target.value)}
              placeholder="(optional)"
              style={{ width: 160 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={dryRun} onChange={() => setDryRun(v => !v)} />
            dryRun (validate only)
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handlePreview} disabled={!file || busy}>
            {busy ? "Uploading…" : "Preview"}
          </button>
          <button onClick={handleCommit} disabled={!file || busy}>
            {busy ? "Uploading…" : "Commit"}
          </button>
          {uploadPct !== null && <span>Progress: {uploadPct}%</span>}
        </div>
      </div>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {preview && (() => {
        const meta = getPreviewMeta(preview);
        const rows = getPreviewRows(preview);
        return (
          <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
            <h3>Preview Result</h3>
            <p>
              <strong>FishingTripId:</strong> {meta.fishingTripId || "·"} &nbsp;·&nbsp;
              <strong>UploadedFileId:</strong> {meta.uploadedFileId || "·"} &nbsp;·&nbsp;
              <strong>Catch Count:</strong> {meta.catchCount || "·"}
            </p>

            <TableFromRows rows={rows} />

            <details style={{ marginTop: 12 }}>
              <summary>Raw JSON</summary>
              <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, maxHeight: 320, overflow: "auto" }}>
                {JSON.stringify(preview, null, 2)}
              </pre>
            </details>
          </div>
        );
      })()}

      {commitResp && (
        <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
          <h3>Commit Response</h3>
          <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
            {JSON.stringify(commitResp, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

/* ---------- helpers ---------- */

function getPreviewMeta(preview: any) {
  const fishingTripId = preview?.FishingTripId ?? preview?.fishingTripId ?? "";
  const uploadedFileId = preview?.UploadedFileId ?? preview?.uploadedFileId ?? "";
  const catchCount = preview?.CatchCount ?? preview?.catchCount ?? "";
  return { fishingTripId, uploadedFileId, catchCount };
}

function getPreviewRows(preview: any): any[] {
  const rows =
    preview?.Sample ??
    preview?.sample ??
    preview?.Rows ??
    preview?.rows ??
    null;

  if (!rows) return [];
  return Array.isArray(rows) ? rows : [rows];
}

function TableFromRows({ rows }: { rows: any[] }) {
  if (!rows.length) {
    return <p style={{ opacity: 0.7 }}>No sample rows returned.</p>;
  }
  const headers = Object.keys(rows[0]);
  const firstRows = rows.slice(0, 10);

  return (
    <div style={{ overflowX: "auto", border: "1px solid #333", borderRadius: 8 }}>
      <table style={{ borderCollapse: "collapse", minWidth: 680 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {firstRows.map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h} style={{ padding: 8, borderBottom: "1px solid #222" }}>
                  {row[h] !== undefined && row[h] !== null ? String(row[h]) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <small style={{ display: "block", padding: 6, opacity: 0.7 }}>
        Showing first {firstRows.length} rows.
      </small>
    </div>
  );
}