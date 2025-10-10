import api from "../lib/api";
import type { OrganizationCreateDto, OrganizationReadDto } from "../types/org";

export async function listOrganizations() {
  const { data } = await api.get<OrganizationReadDto[]>("/api/organizations");
  return data;
}

export async function createOrganization(input: OrganizationCreateDto) {
  const { data } = await api.post<OrganizationReadDto>("/api/organizations", input);
  return data;
}