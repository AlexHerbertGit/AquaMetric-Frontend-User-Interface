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
  const { data } = await api.get("/api/catchquery/by-trip", { params: { fishingTripId } });
  return unbox<CatchReadDto[]>(data);
}