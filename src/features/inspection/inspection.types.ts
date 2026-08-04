export type InspectionStatus = "Pending" | "Passed" | "Failed";

export const InspectionTypeValues = [
  { value: 1, label: "1. Nguyên liệu thô (Raw Material)" },
  { value: 2, label: "2. Sơ chế & Chế biến (Processing)" },
  { value: 3, label: "3. Đóng gói & Nhãn mác (Packaging)" },
  { value: 4, label: "4. Lưu kho & Bảo quản (Storage)" },
  { value: 5, label: "5. Vận chuyển & Logistics (Transportation)" },
  { value: 6, label: "6. Phân phối Bán lẻ (Retail)" },
  { value: 7, label: "7. Lấy mẫu đột xuất (Random Sampling)" },
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
  1: "Nguyên liệu thô (Raw Material)",
  2: "Sơ chế & Chế biến (Processing)",
  3: "Đóng gói (Packaging)",
  4: "Lưu kho (Storage)",
  5: "Vận chuyển (Transportation)",
  6: "Bán lẻ (Retail)",
  7: "Lấy mẫu đột xuất (Random Sampling)",
};

export const StatusLabel: Record<InspectionStatus, string> = {
  Pending: "Chờ kiểm định",
  Passed: "Đạt chuẩn",
  Failed: "Không đạt",
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
