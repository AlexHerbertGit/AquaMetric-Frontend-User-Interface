export interface OrganizationCreateDto {
  organizationName: string;
  industryType: string;
  email: string;
  phoneNumber: string;
  address: string;
}
export interface OrganizationReadDto extends OrganizationCreateDto {
  organizationId: number;
}