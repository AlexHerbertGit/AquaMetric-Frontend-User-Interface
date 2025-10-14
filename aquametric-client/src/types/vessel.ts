export interface VesselCreateDto {
  organizationId: number;                 // from AuthContext.user.organizationId
  fishingVesselName: string;              // required
  fishingVesselRegistrationNumber: string;// required (unique within org)
  ownerName?: string;
  homePort?: string;
  vesselType?: string;
  maxCapacityKg?: number;                 // keep as string if API expects text; change to number if numeric
  gearTypesUsed?: string;
}

export interface VesselReadDto extends VesselCreateDto {
  fishingVesselId: number;                // ✅ fixed typo
  createdAt?: string;
}