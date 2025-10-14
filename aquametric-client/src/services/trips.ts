import api from "../lib/api";

export type TripCreatePayload = {
  fishingVesselId: number;
  userId: number;
  departureDateTime: string; // ISO 8601 UTC with trailing "Z"
  returnDateTime: string;    // ISO 8601 UTC with trailing "Z"
  averageSpeedKmh: number;
  daysAtSea: number;
  totalDistanceKm: number;
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
  };
  return api.post("/api/fishingtrips", body);
}

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

export async function listTripsByUser(userId: number): Promise<TripReadDto[]> {
  if (!userId || userId <= 0) return [];
  try {
    const { data } = await api.get(`/api/FishingTrips/user/${userId}`);
    return data?.items ?? data ?? [];
  } catch {
    // secondary fallback: query-param style if your controller supports it
    const { data } = await api.get(`/api/fishingTrips`, { params: { userId } });
    return data?.items ?? data ?? [];
  }
}

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
};

export async function getCatchesForTrip(fishingTripId: number): Promise<CatchReadDto[]> {
  const res = await api.get(`/api/catches`, { params: { fishingTripId } });
  return res.data?.items ?? res.data ?? [];
}