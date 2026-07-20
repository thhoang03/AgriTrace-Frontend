import type { AxiosRequestConfig } from "axios";
import { recentActivities, batchStatusData } from "../data";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const dashboardHandlers: Record<string, MockHandler> = {
  "GET /dashboard/overview": () =>
    ok({
      stats: {
        totalBatches: 2847,
        activeBatches: 1234,
        totalUsers: 8562,
        activeRecalls: 3,
        totalInspections: 456,
        passedInspections: 423,
      },
      recentActivity: recentActivities.map((a) => ({
        ...a,
        id: String(a.id),
        userId: "USR-001",
        userName: a.user,
      })),
      batchStatusDistribution: batchStatusData.map((d) => ({ status: d.name, count: d.value })),
      inspectionPassRate: 92.8,
    }),
};
