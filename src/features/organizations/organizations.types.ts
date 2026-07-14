export type OrganizationType = "FARM" | "PROCESSOR" | "DISTRIBUTOR" | "INSPECTOR" | "RETAIL";
export type OrganizationStatus = "ACTIVE" | "INACTIVE";

export interface Organization {
  organizationId: number;
  name: string;
  type: OrganizationType;
  status?: OrganizationStatus;
  address?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  type: OrganizationType;
  address?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  type?: OrganizationType;
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
