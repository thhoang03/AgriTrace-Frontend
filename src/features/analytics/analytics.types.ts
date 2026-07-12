export interface AnalyticsOverview {
  totalProducts: number;
  totalBatches: number;
  todayHarvest: number;
  inProcessing: number;
  inTransport: number;
  atRetail: number;
  recallAlerts: number;
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

export interface BatchDistribution {
  byOrganization: OrganizationDistribution[];
  byCategory: CategoryDistribution[];
  byStatus: StatusDistribution[];
}

export interface OrganizationDistribution {
  organizationId: number;
  organizationName: string;
  batchCount: number;
  quantity: number;
}

export interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  batchCount: number;
  quantity: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface ProcessingTime {
  averageProcessingTime: number;
  byStage: StageProcessingTime[];
}

export interface StageProcessingTime {
  stage: string;
  averageHours: number;
  minHours: number;
  maxHours: number;
}
