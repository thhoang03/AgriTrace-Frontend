export type InspectionStatus = "Pending" | "Passed" | "Failed";

export const InspectionTypeValues = [
  { value: 1, label: { vi: "1. Nguyên liệu thô (Raw Material)", en: "1. Raw Material" } },
  { value: 2, label: { vi: "2. Sơ chế & Chế biến (Processing)", en: "2. Processing" } },
  { value: 3, label: { vi: "3. Đóng gói & Nhãn mác (Packaging)", en: "3. Packaging" } },
  { value: 4, label: { vi: "4. Lưu kho & Bảo quản (Storage)", en: "4. Storage" } },
  { value: 5, label: { vi: "5. Vận chuyển & Logistics (Transportation)", en: "5. Transportation" } },
  { value: 6, label: { vi: "6. Phân phối Bán lẻ (Retail)", en: "6. Retail" } },
  { value: 7, label: { vi: "7. Lấy mẫu đột xuất (Random Sampling)", en: "7. Random Sampling" } },
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

export const InspectionTypeLabel: Record<InspectionType, { vi: string; en: string }> = {
  1: { vi: "Nguyên liệu thô (Raw Material)", en: "Raw Material" },
  2: { vi: "Sơ chế & Chế biến (Processing)", en: "Processing" },
  3: { vi: "Đóng gói (Packaging)", en: "Packaging" },
  4: { vi: "Lưu kho (Storage)", en: "Storage" },
  5: { vi: "Vận chuyển (Transportation)", en: "Transportation" },
  6: { vi: "Bán lẻ (Retail)", en: "Retail" },
  7: { vi: "Lấy mẫu đột xuất (Random Sampling)", en: "Random Sampling" },
};

export const StatusLabel: Record<InspectionStatus, string> = {
  Pending: "Chờ kiểm định",
  Passed: "Đạt chuẩn",
  Failed: "Không đạt",
};

export interface CreateInspectionRequest {
  batchId: string;
  inspectionType: number;
  inspectionDate: string;
  notes?: string;
  organizationId?: string;
  location?: string;
}

export interface RequestInspectionRequest {
  batchId: string;
  targetOrganizationId: string;
  inspectionType: InspectionType;
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
