import { get } from "../../lib/api";
import type {
  AnalyticsOverview,
  BatchDistribution,
  ProcessingTime,
} from "./analytics.types";

export const analyticsApi = {
  // GET /analytics/overview - Dashboard tổng quan (ADMIN)
  getOverview: () => get<AnalyticsOverview>("/analytics/overview"),

  // GET /analytics/batch-distribution - Thống kê Batch (ADMIN, MANAGER)
  getBatchDistribution: (params?: {
    organizationId?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
  }) => get<BatchDistribution>("/analytics/batch-distribution", { params }),

  // GET /analytics/processing-time - Thời gian xử lý (ADMIN, MANAGER)
  getProcessingTime: (params?: {
    organizationId?: number;
    startDate?: string;
    endDate?: string;
  }) => get<ProcessingTime>("/analytics/processing-time", { params }),

  // GET /analytics/traceback/{batchId} - Truy vết ngược (ADMIN, INSPECTOR)
  getTraceback: (batchId: string) =>
    get<any>(`/analytics/traceback/${batchId}`),
};
