import { get, post, put, patch } from "../../lib/api";
import type {
  OrganizationListItem,
  OrganizationPagedResponse,
  OrganizationDetail,
  OrganizationCreatedData,
  OrganizationRequest,
  StatusRequest,
} from "../../types/mapping";
import type { OrganizationType, Organization } from "./organizations.types";

export type { OrganizationType } from "./organizations.types";
export type { OrganizationDetail, OrganizationPagedResponse, OrganizationRequest };

const ORG_TYPE_GUIDS: Record<string, string> = {
  FARM: "10000000-0000-0000-0000-000000000001",
  PROCESSOR: "10000000-0000-0000-0000-000000000002",
  DISTRIBUTOR: "10000000-0000-0000-0000-000000000003",
  RETAILER: "10000000-0000-0000-0000-000000000004",
  RETAIL: "10000000-0000-0000-0000-000000000004",
  INSPECTION: "10000000-0000-0000-0000-000000000005",
  SYSTEM: "10000000-0000-0000-0000-000000000006",
};

function getOrganizationTypeId(code: string): string {
  return ORG_TYPE_GUIDS[code.toUpperCase()] || ORG_TYPE_GUIDS.FARM;
}

function adaptStatus(status: any): "ACTIVE" | "INACTIVE" {
  if (!status) return "ACTIVE";
  const s = String(status).toUpperCase();
  return s === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function adaptOrgFromListItem(item: any): Organization {
  return {
    organizationId: item.organizationId ?? 0,
    id: String(item.id ?? item.organizationId ?? ""),
    name: item.name ?? "",
    type: item.type ?? "",
    organizationTypeId: item.organizationTypeId ?? "",
    status: adaptStatus(item.status),
    address: item.address ?? "",
  };
}

function adaptOrgFromDetail(item: any): Organization {
  return {
    organizationId: item.organizationId ?? 0,
    id: String(item.id ?? item.organizationId ?? ""),
    name: item.name ?? "",
    type: item.type ?? "",
    organizationTypeId: item.organizationTypeId ?? "",
    status: adaptStatus(item.status),
    address: item.address ?? "",
  };
}

export const organizationsApi = {
  getAll: async (filters?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    organizationTypeId?: string;
  }) => {
    const response = await get<OrganizationPagedResponse>("/organizations", {
      params: {
        search: filters?.search,
        status: filters?.status,
        organizationTypeId: filters?.organizationTypeId,
        page: filters?.page,
        pageSize: filters?.pageSize,
      },
    });
    const pagedData = response.data as any;
    return {
      data: {
        items: pagedData.items?.map(adaptOrgFromListItem) ?? [],
        totalCount: pagedData.totalCount ?? 0,
        activeCount: pagedData.activeCount ?? pagedData.items?.filter((i: any) => adaptStatus(i.status) === "ACTIVE").length ?? 0,
        inactiveCount: pagedData.inactiveCount ?? pagedData.items?.filter((i: any) => adaptStatus(i.status) === "INACTIVE").length ?? 0,
      },
    };
  },

  getById: async (id: number | string) => {
    const response = await get<OrganizationDetail>(`/organizations/${id}`);
    return { data: adaptOrgFromDetail(response.data) };
  },

  create: async (data: { name: string; organizationTypeId: string; address?: string }) => {
    const newRequest = {
      name: data.name,
      organizationTypeId: data.organizationTypeId,
      address: data.address,
    };
    const response: any = await post("/organizations", newRequest);
    const resultObj = response?.result || response?.data || response;
    return {
      data: {
        organizationId: resultObj?.organizationId || resultObj?.id || 0,
        name: resultObj?.name || data.name,
        type: resultObj?.type || resultObj?.organizationTypeName || "",
        status: resultObj?.status || "ACTIVE",
        address: resultObj?.address || data.address || "",
      }
    };
  },

  update: async (id: number | string, data: { name?: string; organizationTypeId?: string; address?: string }) => {
    const newRequest: any = {};
    if (data.name) newRequest.name = data.name;
    if (data.organizationTypeId) newRequest.organizationTypeId = data.organizationTypeId;
    if (data.address !== undefined) newRequest.address = data.address;
    return put<void>(`/organizations/${id}`, newRequest);
  },

  updateStatus: async (id: number | string, data: { status: string }) => {
    const statusValue = data.status === "ACTIVE" ? "Active" : "Inactive";
    return patch<void>(`/organizations/${id}/status`, {
      status: statusValue,
    } as StatusRequest);
  },

  getUsers: async (
    id: number | string,
    params?: { page?: number; pageSize?: number },
  ) => {
    const response = await get<any>(`/organizations/${id}/users`, { params });
    const pagedData = response.data as any;
    return {
      data: {
        items: pagedData.items ?? [],
        totalCount: pagedData.totalCount ?? 0,
      },
    };
  },

  inviteStaff: async (orgId: number | string, email: string) => {
    const response = await post<{ userId: string }>(
      `/organizations/${orgId}/invite`,
      { email },
    );
    return { data: response.data };
  },
};
