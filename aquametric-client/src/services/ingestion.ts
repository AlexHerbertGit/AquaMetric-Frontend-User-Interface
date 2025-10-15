import api from "../lib/api";

export type IngestionResult = {
  fishingTripId: number;
  catchId: number;
  uploadedFileId?: number | null;
  message?: string;
};

export async function ingestTripCsv(
  fishingTripId: number,
  file: File,
  uploadedFileId?: number
): Promise<IngestionResult> {
  const form = new FormData();
  form.append("FishingTripId", String(fishingTripId));
  form.append("CsvFile", file);
  if (uploadedFileId) form.append("UploadedFileId", String(uploadedFileId));

  const { data } = await api.post("/api/ingestion/trip-csv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}