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
  totalBatches?: number;
  totalOrganizations?: number;
  totalEvents?: number;
  totalRecalls?: number;
  activeBatches?: number;
  recalledBatches?: number;
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

const DEFAULT_MONTHLY_PRODUCTION: MonthlyProductionData[] = [
  { month: "Jan", quantity: 12500, batches: 32 },
  { month: "Feb", quantity: 18200, batches: 45 },
  { month: "Mar", quantity: 24800, batches: 58 },
  { month: "Apr", quantity: 21000, batches: 50 },
  { month: "May", quantity: 29500, batches: 72 },
  { month: "Jun", quantity: 34000, batches: 86 },
];

const DEFAULT_INSPECTION_RESULTS: InspectionData[] = [
  { month: "Jan", pass: 42, fail: 2, pending: 1 },
  { month: "Feb", pass: 58, fail: 3, pending: 2 },
  { month: "Mar", pass: 76, fail: 1, pending: 4 },
  { month: "Apr", pass: 64, fail: 4, pending: 2 },
  { month: "May", pass: 89, fail: 2, pending: 5 },
  { month: "Jun", pass: 105, fail: 3, pending: 3 },
];

const DEFAULT_RECALL_TREND: RecallTrendData[] = [
  { month: "Jan", recalls: 1 },
  { month: "Feb", recalls: 0 },
  { month: "Mar", recalls: 2 },
  { month: "Apr", recalls: 1 },
  { month: "May", recalls: 0 },
  { month: "Jun", recalls: 2 },
];

function getBatchStatusData(data: any): BatchStatusData[] {
  if (Array.isArray(data.batchStatus) && data.batchStatus.length > 0) {
    return data.batchStatus;
  }
  const total = data.totalBatches || 50;
  const recalled = data.recalledBatches || 2;
  const active = data.activeBatches || Math.max(1, total - recalled);

  const created = Math.max(1, Math.round(active * 0.2));
  const processing = Math.max(1, Math.round(active * 0.25));
  const transport = Math.max(1, Math.round(active * 0.25));
  const retail = Math.max(1, Math.round(active * 0.3));

  return [
    { name: "Created / Harvest", value: created },
    { name: "In Processing", value: processing },
    { name: "In Transport", value: transport },
    { name: "At Retail", value: retail },
    { name: "Recalled", value: recalled },
  ];
}

// Adapter functions
function adaptOverviewFromData(data: any): AnalyticsOverview {
  const totalBatches = data.totalBatches ?? 0;
  const activeBatches = data.activeBatches ?? 0;
  const totalRecalls = data.totalRecalls ?? 0;

  const monthlyProduction =
    Array.isArray(data.monthlyProduction) && data.monthlyProduction.length > 0
      ? data.monthlyProduction
      : DEFAULT_MONTHLY_PRODUCTION;

  const batchStatus = getBatchStatusData(data);

  const inspectionResults =
    Array.isArray(data.inspectionResults) && data.inspectionResults.length > 0
      ? data.inspectionResults
      : DEFAULT_INSPECTION_RESULTS;

  const recallTrend =
    Array.isArray(data.recallTrend) && data.recallTrend.length > 0
      ? data.recallTrend
      : DEFAULT_RECALL_TREND;

  return {
    totalProducts: totalBatches,
    todayHarvest: activeBatches,
    inProcessing: Math.round(activeBatches * 0.25),
    inTransport: Math.round(activeBatches * 0.25),
    atRetail: Math.round(activeBatches * 0.3),
    recallAlerts: totalRecalls,
    totalBatches,
    totalOrganizations: data.totalOrganizations ?? 0,
    totalEvents: data.totalEvents ?? 0,
    totalRecalls,
    activeBatches,
    recalledBatches: data.recalledBatches ?? 0,
    monthlyProduction,
    batchStatus,
    inspectionResults,
    recallTrend,
  };
}

export const analyticsApi = {
  getOverview: async () => {
    const response = await get<OverviewData>("/analytics/overview");
    return { data: adaptOverviewFromData(response.data) };
  },

  getBatchDistribution: async (params?: {
    organizationId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await get<BatchDistributionData>("/analytics/batch-distribution", { params });
    return { data: (response.data as any) as BatchDistribution };
  },

  getProcessingTime: async (params?: {
    organizationId?: string;
    eventTypeId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await get<ProcessingTimeData>("/analytics/processing-time", { params });
    return { data: (response.data as any) as ProcessingTime };
  },

  getTraceback: async (batchId: string) => {
    const response = await get<TracebackData>(`/analytics/traceback/${batchId}`);
    return { data: response.data as any };
  },
};
