import { get, post, put, patch } from "../../lib/api";
import type {
  OrganizationListItem,
  OrganizationPagedResponse,
  OrganizationDetail,
  OrganizationCreatedData,
  OrganizationRequest,
  StatusRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export type OrganizationType = "FARM" | "PROCESSOR" | "DISTRIBUTOR" | "INSPECTOR" | "RETAILER";
export type OrganizationStatus = "ACTIVE" | "INACTIVE";

export interface Organization {
  organizationId: number;
  name: string;
  type: string;
  status?: string;
  address?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  type: string;
  address?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  type?: string;
  address?: string;
}

export interface UpdateOrganizationStatusRequest {
  status: string;
}

export interface OrganizationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Legacy type exports
export type { OrganizationDetail, OrganizationPagedResponse, OrganizationRequest };

// Adapter functions
function mapTypeToNew(oldType: string): OrganizationRequest["type"] {
  const map: Record<string, OrganizationRequest["type"]> = {
    FARM: "FARM",
    PROCESSOR: "PROCESSOR",
    DISTRIBUTOR: "DISTRIBUTOR",
    RETAILER: "RETAILER",
    RETAIL: "RETAILER",
    INSPECTOR: "INSPECTOR_ORG",
  };
  return map[oldType] ?? "FARM";
}

function adaptOrgFromListItem(item: any): Organization {
  return {
    organizationId: item.organizationId ?? 0,
    name: item.name ?? "",
    type: item.type ?? "",
    status: item.status ?? "ACTIVE",
    address: item.address ?? "",
  };
}

function adaptOrgFromDetail(item: any): Organization {
  return {
    organizationId: item.organizationId ?? 0,
    name: item.name ?? "",
    type: item.type ?? "",
    status: item.status ?? "ACTIVE",
    address: item.address ?? "",
  };
}

export const organizationsApi = {
  getAll: async (filters?: OrganizationFilters) => {
    const response = await get<OrganizationPagedResponse>("/organizations", {
      params: {
        search: filters?.search,
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    const pagedData = response.data as any;
    return {
      data: {
        items: pagedData.items?.map(adaptOrgFromListItem) ?? [],
        totalCount: pagedData.totalCount ?? 0,
      }
    };
  },

  getById: async (id: number | string) => {
    const response = await get<OrganizationDetail>(`/organizations/${id}`);
    return { data: adaptOrgFromDetail(response.data) };
  },

  create: async (data: CreateOrganizationRequest) => {
    const newRequest: OrganizationRequest = {
      name: data.name,
      type: mapTypeToNew(data.type),
      address: data.address,
    };
    const response = await post<OrganizationCreatedData>("/organizations", newRequest);
    return { data: { organizationId: (response.data as any).organizationId ?? 0 } };
  },

  update: async (id: number | string, data: UpdateOrganizationRequest) => {
    const newRequest: Partial<OrganizationRequest> = {};
    if (data.name) newRequest.name = data.name;
    if (data.type) newRequest.type = mapTypeToNew(data.type);
    if (data.address !== undefined) newRequest.address = data.address;
    return put<void>(`/organizations/${id}`, newRequest);
  },

  updateStatus: async (id: number | string, data: UpdateOrganizationStatusRequest) => {
    return patch<void>(`/organizations/${id}/status`, { status: data.status } as StatusRequest);
  },

  getUsers: async (id: number | string, params?: { page?: number; pageSize?: number }) => {
    const response = await get<any>(`/organizations/${id}/users`, { params });
    const pagedData = response.data as any;
    return {
      data: {
        items: pagedData.items ?? [],
        totalCount: pagedData.totalCount ?? 0,
      }
    };
  },
};
