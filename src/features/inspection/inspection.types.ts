export type InspectionStatus = "Passed" | "Failed" | "Pending" | "In Progress";
export type InspectionCategory = "Quality" | "Safety" | "Regulatory";

export interface InspectionItem {
  id: string;
  batchId: string;
  product: string;
  inspector: string;
  organization: string;
  date: string;
  category: InspectionCategory;
  status: InspectionStatus;
  score: number;
  notes: string;
}

export interface CreateInspectionRequest {
  batchId: string;
  category: InspectionCategory;
  inspector: string;
  notes?: string;
}

export interface InspectionFilters {
  status?: InspectionStatus | "All";
  category?: InspectionCategory | "All";
  page?: number;
  limit?: number;
}
