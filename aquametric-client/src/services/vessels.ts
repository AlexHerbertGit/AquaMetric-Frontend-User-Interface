import api from "../lib/api";
import type { VesselCreateDto, VesselReadDto } from "../types/vessel";

export async function createVessel(input: VesselCreateDto) {
  const { data } = await api.post<VesselReadDto>("/api/fishingVessels", input);
  return data;
}

export async function listVesselsByOrg(organizationId: number) {
  const { data } = await api.get<VesselReadDto[]>("/api/fishingVessels", {
    params: { organizationId },
  });
  return data;
}