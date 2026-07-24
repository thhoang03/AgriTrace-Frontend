import { get } from "../../lib/api";
import type { OverviewData } from "../../types/mapping";

// Legacy types for backward compatibility
export interface DashboardOverview {
  totalBatches?: number;
  totalOrganizations?: number;
  totalEvents?: number;
  totalRecalls?: number;
  activeBatches?: number;
  recalledBatches?: number;
}

export const dashboardApi = {
  getOverview: async () => {
    const response = await get<OverviewData>("/dashboard/overview");
    return { data: (response.data as any) as DashboardOverview };
  },
};
