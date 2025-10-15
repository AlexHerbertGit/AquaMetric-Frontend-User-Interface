export interface VesselCreateDto {
  organizationId: number;                 // from AuthContext.user.organizationId
  fishingVesselName: string;              // required
  fishingVesselRegistrationNumber: string;// required (unique within org)
  ownerName?: string;
  homePort?: string;
  vesselType?: string;
  maxCapacityKg?: number;                 
  gearTypesUsed?: string;
}

export interface VesselReadDto extends VesselCreateDto {
  fishingVesselId: number;                
  createdAt?: string;
}