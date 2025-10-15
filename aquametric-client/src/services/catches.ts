import api from "../lib/api";

export type CatchReadDto = {
  catchId: number;
  fishingTripId: number;
  startDateTime?: string | null;
  finishDateTime?: string | null;
  totalWeightKg?: number | null;
  fishingMethodCode?: string | null;
  targetSpeciesCode?: string | null;
  statisticalAreaCode?: string | null;
  nfpsPresent?: boolean | null;
  amendmentReason?: string | null;
  notes?: string | null;
};

export type CatchMetaDataReadDto = {
  catchMetaDataId: number;
  catchId: number;
  waterTempC?: number | null;
  catchDepthM?: number | null;
  visibilityM?: number | null;
  gearType?: string | null;
  chlorophyllAUgL?: number | null;
  phytoCellsPerL?: number | null;
  averageHooksPerLine?: number | null;
  bottomDepthMetres?: number | null;
  hooksNumber?: number | null;
  linesHaulsCount?: number | null;
  mitigationDeviceCode?: string | null;
};

export type CatchSpeciesReadDto = {
  catchSpeciesId: number;
  catchId: number;
  fishSpeciesId: number;
  quantity?: number | null;
  avgLengthCm?: number | null;
  greenweightKg?: number | null;
};

function unbox<T>(data: any): T {
  return (data?.items ?? data ?? []) as T;
}

export async function listCatchesByTrip(fishingTripId: number): Promise<CatchReadDto[]> {
  const { data } = await api.get("/api/catches", { params: { fishingTripId } });
  return unbox<CatchReadDto[]>(data);
}

// Try both route styles, return array either from {items: []} or raw
export async function getCatchMetaData(catchId: number): Promise<CatchMetaDataReadDto[]> {
  try {
    const { data } = await api.get("/api/catchmetadata", { params: { catchId } });
    return data?.items ?? data ?? [];
  } catch {
    const { data } = await api.get(`/api/catchmetadata/by-catch/${catchId}`);
    return data?.items ?? data ?? [];
  }
}

export async function getCatchSpecies(catchId: number): Promise<CatchSpeciesReadDto[]> {
  try {
    const { data } = await api.get("/api/catchspecies", { params: { catchId } });
    return data?.items ?? data ?? [];
  } catch {
    const { data } = await api.get(`/api/catchspecies/by-catch/${catchId}`);
    return data?.items ?? data ?? [];
  }
}