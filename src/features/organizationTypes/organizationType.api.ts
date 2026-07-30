import { get } from "../../lib/api";
import type { OrganizationTypeItem } from "./organizationType.type";

export const organizationTypeApi = {
  getAll: async () => {
    const response = await get<OrganizationTypeItem[]>("/organization-types");
    return response.data ?? [];
  },
};
