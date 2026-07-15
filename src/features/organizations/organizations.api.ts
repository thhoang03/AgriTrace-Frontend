import { getPaginated, get, post, put, patch } from "../../lib/api";
import type { UserItem } from "../users/users.types";
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UpdateOrganizationStatusRequest,
  OrganizationFilters,
} from "./organizations.types";

export type { Organization };

const USE_MOCK = true;

const mockOrgs: Organization[] = [
  { organizationId: 1, name: "Green Farm Đà Lạt", type: "FARM", address: "Đà Lạt, Lâm Đồng", status: "ACTIVE" },
  { organizationId: 2, name: "Nhà máy chế biến Tây Nguyên", type: "PROCESSOR", address: "Buôn Ma Thuột, Đắk Lắk", status: "ACTIVE" },
  { organizationId: 3, name: "Công ty phân phối Miền Nam", type: "DISTRIBUTOR", address: "TP. Hồ Chí Minh", status: "ACTIVE" },
  { organizationId: 4, name: "Siêu thị Xanh", type: "RETAIL", address: "Hà Nội", status: "INACTIVE" },
  { organizationId: 5, name: "Trung tâm kiểm định MARD", type: "INSPECTOR", address: "Hà Nội", status: "ACTIVE" },
];

const mockDelay = () => new Promise((r) => setTimeout(r, 500));

export const organizationsApi = {
  getAll: async (filters?: OrganizationFilters) => {
    if (USE_MOCK) {
      await mockDelay();
      return { data: { items: mockOrgs, totalCount: mockOrgs.length, page: 1, pageSize: 20, totalPages: 1 } };
    }
    return getPaginated<Organization>("/organizations", { params: filters });
  },

  getById: async (id: number | string) => {
    if (USE_MOCK) {
      await mockDelay();
      return { data: mockOrgs.find((o) => o.organizationId === Number(id))! };
    }
    return get<Organization>(`/organizations/${id}`);
  },

  create: async (data: CreateOrganizationRequest) => {
    if (USE_MOCK) {
      await mockDelay();
      const newOrg: Organization = { organizationId: Date.now(), status: "ACTIVE", ...data };
      mockOrgs.push(newOrg);
      return { data: newOrg };
    }
    return post<Organization>("/organizations", data);
  },

  update: async (id: number | string, data: UpdateOrganizationRequest) => {
    if (USE_MOCK) {
      await mockDelay();
      const idx = mockOrgs.findIndex((o) => o.organizationId === Number(id));
      if (idx !== -1) mockOrgs[idx] = { ...mockOrgs[idx], ...data };
      return { data: mockOrgs[idx] };
    }
    return put<Organization>(`/organizations/${id}`, data);
  },

  updateStatus: async (id: number | string, data: UpdateOrganizationStatusRequest) => {
    if (USE_MOCK) {
      await mockDelay();
      const idx = mockOrgs.findIndex((o) => o.organizationId === Number(id));
      if (idx !== -1) mockOrgs[idx].status = data.status;
      return { data: undefined };
    }
    return patch<void>(`/organizations/${id}/status`, data);
  },

  getUsers: async (id: number | string, params?: { page?: number; pageSize?: number }) => {
    if (USE_MOCK) {
      await mockDelay();
      return { data: { items: [] as UserItem[], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 } };
    }
    return getPaginated<UserItem>(`/organizations/${id}/users`, { params });
  },
};
