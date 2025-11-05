// src/services/trips.ts
import api from "../lib/api";

export type TripCreatePayload = {
  fishingVesselId: number;
  userId: number;
  departureDateTime: string; // ISO 8601 UTC with trailing "Z"
  returnDateTime: string;    // ISO 8601 UTC with trailing "Z"
  averageSpeedKmh: number;
  daysAtSea: number;
  totalDistanceKm: number;
  masterOrFisherName: string;
  isVesselUsed: boolean;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  notes?: string;
};

export type TripReadDto = {
  fishingTripId: number;
  fishingVesselId: number;
  fishingVesselName?: string;
  userId: number;
  clientNumber?: string | null;
  departureDateTime?: string | null;
  returnDateTime?: string | null;
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

  // NEW: hydrated by GetByTripAsync server-side
  metaData?: CatchMetaDataReadDto | null;
  species?: CatchSpeciesReadDto[];
};

export async function createTrip(payload: TripCreatePayload) {
  // Send ONLY the keys required by the API
  const body: TripCreatePayload = {
    fishingVesselId: Number(payload.fishingVesselId),
    userId: Number(payload.userId),
    departureDateTime: payload.departureDateTime,
    returnDateTime: payload.returnDateTime,
    averageSpeedKmh: Number(payload.averageSpeedKmh ?? 0),
    daysAtSea: Number(payload.daysAtSea ?? 0),
    totalDistanceKm: Number(payload.totalDistanceKm ?? 0),
    masterOrFisherName: payload.masterOrFisherName,
    isVesselUsed: Boolean(payload.isVesselUsed),
  };

  if (payload.startLatitude !== undefined) {
    body.startLatitude = Number(payload.startLatitude);
  }
  if (payload.startLongitude !== undefined) {
    body.startLongitude = Number(payload.startLongitude);
  }
  if (payload.endLatitude !== undefined) {
    body.endLatitude = Number(payload.endLatitude);
  }
  if (payload.endLongitude !== undefined) {
    body.endLongitude = Number(payload.endLongitude);
  }
  if (payload.notes !== undefined) {
    body.notes = payload.notes;
  }
  return api.post("/api/fishingtrips", body);
}

export async function listTripsByUser(userId: number): Promise<TripReadDto[]> {
  const { data } = await api.get(`/api/fishingtrips/user/${userId}`);
  return data;
}

export async function getTripById(tripId: number): Promise<TripReadDto> {
  const { data } = await api.get(`/api/fishingtrips/${tripId}`);
  return data;
}


export async function getCatchesForTrip(tripId: number): Promise<CatchReadDto[]> {
  const { data } = await api.get(`/api/catchquery/by-trip/${tripId}`);
  return data;
}