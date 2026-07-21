import { get } from "../../lib/api";
import type {
  OverviewData,
  BatchDistributionData,
  ProcessingTimeData,
  TracebackData,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface AnalyticsOverview {
  totalProducts?: number;
  todayHarvest?: number;
  inProcessing?: number;
  inTransport?: number;
  atRetail?: number;
  recallAlerts?: number;
  monthlyProduction?: MonthlyProductionData[];
  batchStatus?: BatchStatusData[];
  inspectionResults?: InspectionData[];
  recallTrend?: RecallTrendData[];
}

export interface MonthlyProductionData {
  month: string;
  quantity: number;
  batches: number;
}

export interface BatchStatusData {
  name: string;
  value: number;
}

export interface InspectionData {
  month: string;
  pass: number;
  fail: number;
  pending: number;
}

export interface RecallTrendData {
  month: string;
  recalls: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BatchDistribution {
  // Legacy - content varies by use
  [key: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProcessingTime {
  // Legacy - content varies by use
  [key: string]: any;
}

// Adapter functions
function adaptOverviewFromData(data: any): AnalyticsOverview {
  return {
    totalProducts: data.totalBatches ?? 0,
    todayHarvest: data.activeBatches ?? 0,
    inProcessing: 0,
    inTransport: 0,
    atRetail: 0,
    recallAlerts: data.totalRecalls ?? 0,
    monthlyProduction: [],
    batchStatus: [],
    inspectionResults: [],
    recallTrend: [],
  };
}

export const analyticsApi = {
  getOverview: async () => {
    const response = await get<OverviewData>("/analytics/overview");
    return { data: adaptOverviewFromData(response.data) };
  },

  getBatchDistribution: async (params?: {
    organizationId?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await get<BatchDistributionData>("/analytics/batch-distribution", { params });
    return { data: (response.data as any) as BatchDistribution };
  },

  getProcessingTime: async (params?: {
    organizationId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await get<ProcessingTimeData>("/analytics/processing-time", { params });
    return { data: (response.data as any) as ProcessingTime };
  },

  getTraceback: async (batchId: string) => {
    const response = await get<TracebackData>(`/analytics/traceback/${batchId}`);
    return { data: response.data as any };
  },
};
