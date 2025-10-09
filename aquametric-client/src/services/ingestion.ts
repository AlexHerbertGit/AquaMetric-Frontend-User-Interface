import api from "../lib/api";

export type PreviewSample = {
  timestamp: string;
  latitude: number;
  longitude: number;
  totalWeightKg: number;
  speciesCount: number;
};

export type PreviewResponse = {
  fishingTripId: number;
  uploadedFileId: number;
  catchCount: number;
  sample: PreviewSample[];
};

type Extras = {
  FishingTripId?: number | string;
  VesselId?: number | string;
};

export async function previewCsv(
  file: File,
  extras?: Extras,
  onUploadProgress?: (pct: number) => void
) {
  const form = new FormData();
  form.append("File", file); // MUST match controller
  if (extras?.FishingTripId != null) form.append("FishingTripId", String(extras.FishingTripId));
  if (extras?.VesselId != null) form.append("VesselId", String(extras.VesselId));

  const { data } = await api.post<PreviewResponse>("/api/ingestion/preview", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: e => {
      if (!e.total) return;
      onUploadProgress?.(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}

export async function commitCsv(
  file: File,
  extras?: Extras,
  dryRun: boolean = false,
  onUploadProgress?: (pct: number) => void
) {
  const form = new FormData();
  form.append("File", file);
  if (extras?.FishingTripId != null) form.append("FishingTripId", String(extras.FishingTripId));
  if (extras?.VesselId != null) form.append("VesselId", String(extras.VesselId));

  // Controller route is /commit (not /import), and takes dryRun as a query param
  const { data } = await api.post(`/api/ingestion/commit?dryRun=${dryRun}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: e => {
      if (!e.total) return;
      onUploadProgress?.(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data as unknown; // service result shape depends on your ingestion service
}