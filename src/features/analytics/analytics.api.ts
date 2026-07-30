import { get } from "../../lib/api";
import type { ApiResponse } from "../../types/mapping";

export interface OverviewResponse {
  totalBatches: number;
  totalOrganizations: number;
  totalEvents: number;
  totalRecalls: number;
  activeBatches: number;
  recalledBatches: number;
  monthlyProduction: MonthlyProductionData[];
  batchStatus: BatchStatusData[];
  inspectionResults: InspectionData[];
  recallTrend: RecallTrendData[];
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

export interface BatchDistributionResponse {
  items: BatchDistributionItemResponse[];
  totalCount: number;
}

export interface BatchDistributionItemResponse {
  status: number;
  statusName: string;
  count: number;
}

export interface ProcessingTimeResponse {
  averageProcessingHours: number;
  byEventType: ProcessingTimeByEventTypeResponse[];
}

export interface ProcessingTimeByEventTypeResponse {
  eventTypeCode: string | null;
  averageHours: number;
}

export interface TracebackResponse {
  batchId: string;
  batchCode: string;
  affectedBatches: AffectedBatchResponse[];
  relatedOrganizations: RelatedOrganizationResponse[];
}

export interface AffectedBatchResponse {
  batchId: string;
  batchCode: string;
  relationship: string;
}

export interface RelatedOrganizationResponse {
  organizationId: string;
  name: string;
  type: string | null;
}

export const analyticsApi = {
  getOverview: async () => {
    const response = await get<ApiResponse>("/analytics/overview");
    const raw = response.data as any;
    const data = raw?.data ?? raw;
    return { data: data as OverviewResponse };
  },

  getBatchDistribution: async (params?: {
    organizationId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await get<ApiResponse>("/analytics/batch-distribution", { params });
    const raw = response.data as any;
    const data = raw?.data ?? raw;
    return { data: data as BatchDistributionResponse };
  },

  getProcessingTime: async (params?: {
    organizationId?: string;
    eventTypeId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await get<ApiResponse>("/analytics/processing-time", { params });
    const raw = response.data as any;
    const data = raw?.data ?? raw;
    return { data: data as ProcessingTimeResponse };
  },

  getTraceback: async (batchId: string) => {
    const response = await get<ApiResponse>(`/analytics/traceback/${batchId}`);
    const raw = response.data as any;
    const data = raw?.data ?? raw;
    return { data: data as TracebackResponse };
  },
};
