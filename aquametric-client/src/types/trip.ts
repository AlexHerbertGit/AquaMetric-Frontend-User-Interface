// Types the client uses. Service will add server-compat alias keys at runtime.
export interface FishingTripCreateDto {
  fishingVesselId: number;          // required
  userId: number;                   // required by API
  departureDateTimeUtc: string;     // ISO UTC
  returnDateTimeUtc: string;        // ISO UTC
  totalDistanceKm: number;          // > 0
  daysAtSea: number;                // >= 1
  masterOrFisherName: string;
  isVesselUsed: boolean;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;                
}

export interface FishingTripReadDto extends FishingTripCreateDto {
  fishingTripId: number;
  averageSpeedKmph: number;         // computed server-side
  createdAt?: string;
}