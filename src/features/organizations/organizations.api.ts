import { get, post, put, patch } from "../../lib/api";

export interface Organization {
  organizationId: number;
  name: string;
  type: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface OrganizationListResponse {
  items: Organization[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const USE_MOCK = true;

const mockOrgs: Organization[] = [
  { organizationId: 1, name: "Green Farm Đà Lạt", type: "FARM", address: "Đà Lạt, Lâm Đồng", status: "ACTIVE" },
  { organizationId: 2, name: "Nhà máy chế biến Tây Nguyên", type: "PROCESSOR", address: "Buôn Ma Thuột, Đắk Lắk", status: "ACTIVE" },
  { organizationId: 3, name: "Công ty phân phối Miền Nam", type: "DISTRIBUTOR", address: "TP. Hồ Chí Minh", status: "ACTIVE" },
  { organizationId: 4, name: "Siêu thị Xanh", type: "RETAILER", address: "Hà Nội", status: "INACTIVE" },
  { organizationId: 5, name: "Trung tâm kiểm định MARD", type: "INSPECTOR", address: "Hà Nội", status: "ACTIVE" },
];

const mockDelay = () => new Promise((r) => setTimeout(r, 500));

export const organizationsApi = {
  getList: async (page = 1, pageSize = 20): Promise<OrganizationListResponse> => {
    if (USE_MOCK) {
      await mockDelay();
      return { items: mockOrgs, totalCount: mockOrgs.length, page, pageSize, totalPages: 1 };
    }
    const res = await get<OrganizationListResponse>(`/organizations?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },

  getById: async (id: number): Promise<Organization> => {
    if (USE_MOCK) {
      await mockDelay();
      return mockOrgs.find((o) => o.organizationId === id)!;
    }
    const res = await get<Organization>(`/organizations/${id}`);
    return res.data;
  },

  create: async (data: { name: string; type: string; address: string }): Promise<{ organizationId: number }> => {
    if (USE_MOCK) {
      await mockDelay();
      const newOrg: Organization = { organizationId: Date.now(), status: "ACTIVE", ...data };
      mockOrgs.push(newOrg);
      return { organizationId: newOrg.organizationId };
    }
    const res = await post<{ organizationId: number }>("/organizations", data);
    return res.data;
  },

  update: async (id: number, data: { name: string; type: string; address: string }): Promise<void> => {
    if (USE_MOCK) {
      await mockDelay();
      const idx = mockOrgs.findIndex((o) => o.organizationId === id);
      if (idx !== -1) mockOrgs[idx] = { ...mockOrgs[idx], ...data };
      return;
    }
    await put(`/organizations/${id}`, data);
  },

  updateStatus: async (id: number, status: "ACTIVE" | "INACTIVE"): Promise<void> => {
    if (USE_MOCK) {
      await mockDelay();
      const idx = mockOrgs.findIndex((o) => o.organizationId === id);
      if (idx !== -1) mockOrgs[idx].status = status;
      return;
    }
    await patch(`/organizations/${id}/status`, { status });
  },
};
