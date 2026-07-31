export type OrganizationType = string;
export type OrganizationStatus = "ACTIVE" | "INACTIVE";

export interface Organization {
  organizationId: number;
  name: string;
  type: OrganizationType;
  organizationTypeId?: string;
  status?: OrganizationStatus;
  address?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  organizationTypeId?: string;
  address?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  organizationTypeId?: string;
  address?: string;
}

export interface UpdateOrganizationStatusRequest {
  status: OrganizationStatus;
}

export interface OrganizationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}
