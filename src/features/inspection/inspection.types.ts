export type InspectionStatus = "Pending" | "Passed" | "Failed";

export const InspectionTypeValues = [
  { value: 1, label: "Raw Material" },
  { value: 2, label: "Processing" },
  { value: 3, label: "Packaging" },
  { value: 4, label: "Storage" },
  { value: 5, label: "Transportation" },
  { value: 6, label: "Retail" },
  { value: 7, label: "Random Sampling" },
] as const;

export type InspectionType = (typeof InspectionTypeValues)[number]["value"];

export interface LabTest {
  id: string;
  inspectionId: string;
  testName: string;
  measuredValue?: string;
  unit?: string;
  minStandardValue?: string;
  maxStandardValue?: string;
  isPassed: boolean;
  remark?: string;
  createdAt: string;
}

export interface CreateLabTestRequest {
  testName: string;
  measuredValue?: string;
  unit?: string;
  minStandardValue?: string;
  maxStandardValue?: string;
  isPassed: boolean;
  remark?: string;
}

export interface InspectionItem {
  id: string;
  batchId: string;
  batchCode: string;
  inspectorId: string;
  inspector: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  overallResult?: string;
  inspectionDate: string;
  notes: string;
  createdAt: string;
  labTests: LabTest[];
}

export const InspectionTypeLabel: Record<InspectionType, string> = {
  1: "Raw Material",
  2: "Processing",
  3: "Packaging",
  4: "Storage",
  5: "Transportation",
  6: "Retail",
  7: "Random Sampling",
};

export const StatusLabel: Record<InspectionStatus, string> = {
  Pending: "Pending",
  Passed: "Passed",
  Failed: "Failed",
};

export interface CreateInspectionRequest {
  batchId: string;
  inspectionType: InspectionType;
  inspectionDate: string;
  notes: string;
}

export interface ConcludeInspectionRequest {
  id: string;
  overallResult: "PASS" | "FAIL";
  notes?: string;
}

export interface InspectionFilters {
  page?: number;
  limit?: number;
}
