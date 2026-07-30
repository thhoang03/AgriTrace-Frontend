export interface AnalyticsOverview {
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

export interface BatchDistribution {
  items: BatchDistributionItem[];
  totalCount: number;
  byOrganization: OrganizationDistribution[];
  byCategory: CategoryDistribution[];
  byStatus: StatusDistribution[];
}

export interface BatchDistributionItem {
  status: number;
  statusName: string;
  count: number;
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
  averageProcessingHours: number;
  byEventType: EventProcessingTime[];
  averageProcessingTime: number;
  byStage: StageProcessingTime[];
}

export interface EventProcessingTime {
  eventTypeCode: string;
  averageHours: number;
}

export interface StageProcessingTime {
  stage: string;
  averageHours: number;
  minHours: number;
  maxHours: number;
}
