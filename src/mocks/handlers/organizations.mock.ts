import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

const mockOrgs = [
  { organizationId: 1, name: "Green Farm Đà Lạt", type: "FARM", address: "Đà Lạt, Lâm Đồng", status: "ACTIVE" },
  { organizationId: 2, name: "Nhà máy chế biến Tây Nguyên", type: "PROCESSOR", address: "Buôn Ma Thuột, Đắk Lắk", status: "ACTIVE" },
  { organizationId: 3, name: "Công ty phân phối Miền Nam", type: "DISTRIBUTOR", address: "TP. Hồ Chí Minh", status: "ACTIVE" },
  { organizationId: 4, name: "Siêu thị Xanh", type: "RETAIL", address: "Hà Nội", status: "INACTIVE" },
  { organizationId: 5, name: "Trung tâm kiểm định MARD", type: "INSPECTOR", address: "Hà Nội", status: "ACTIVE" },
];

export const organizationHandlers: Record<string, MockHandler> = {
  "GET /organizations": () => ok({ items: mockOrgs, totalCount: mockOrgs.length, page: 1, pageSize: 20, totalPages: 1 }),

  "GET /organizations/:id": (config) => {
    const id = Number(config.url?.split("/").pop() ?? "");
    const org = mockOrgs.find((o) => o.organizationId === id);
    if (!org) return { data: null, message: "Not found", status: 404 };
    return ok(org);
  },

  "POST /organizations": (config) => {
    const newOrg = { organizationId: Date.now(), status: "ACTIVE", ...config.data };
    mockOrgs.push(newOrg);
    return ok(newOrg);
  },

  "PUT /organizations/:id": (config) => {
    const id = Number(config.url?.split("/").pop() ?? "");
    const idx = mockOrgs.findIndex((o) => o.organizationId === id);
    if (idx !== -1) mockOrgs[idx] = { ...mockOrgs[idx], ...config.data };
    return ok(mockOrgs[idx]);
  },

  "PATCH /organizations/:id/status": (config) => {
    const id = Number(config.url?.split("/").slice(-2, -1)[0] ?? "");
    const idx = mockOrgs.findIndex((o) => o.organizationId === id);
    if (idx !== -1) mockOrgs[idx].status = config.data?.status;
    return ok(undefined);
  },

  "GET /organizations/:id/users": () => ok({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }),
};
