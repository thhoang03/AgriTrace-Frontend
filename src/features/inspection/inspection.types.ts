export type InspectionResult = "Pass" | "Fail" | "Pending";
export type InspectionCategory = "Quality" | "Safety" | "Regulatory";

export interface LabTest {
  name: string;
  result: string;
  standard: string;
  ok: boolean;
}

export interface InspectionItem {
  id: string;
  batchId: string;
  batchCode: string;
  product: string;
  productImage?: string;
  result: InspectionResult;
  inspector: string;
  inspectorId?: string;
  organization: string;
  date: string;
  category: InspectionCategory;
  score: number;
  notes: string;
  certificate: string | null;
  tests: LabTest[];
  status?: number;
}

export interface CreateInspectionRequest {
  batchId: string;
  category: InspectionCategory;
  inspector: string;
  result: InspectionResult;
  notes: string;
}

export interface InspectionFilters {
  status?: InspectionResult | "All";
  category?: InspectionCategory | "All";
  search?: string;
  page?: number;
  limit?: number;
}
