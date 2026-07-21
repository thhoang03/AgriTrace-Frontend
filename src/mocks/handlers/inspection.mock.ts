import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

const mockData = [
  {
    inspectionId: "INS-2024-001",
    batchId: "BTH-2024-001",
    batchCode: "BTH-2024-001",
    product: "Organic Dragon Fruit",
    productImage: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
    result: "PASS",
    inspector: "Lý Thị Ngọc",
    inspectorId: "USR-001",
    organization: "Vietnam Food Authority (VFA)",
    createdAt: "2024-06-16T00:00:00Z",
    category: "Quality",
    score: 96,
    notes: "All parameters within acceptable limits. Product meets VFA food safety standards. No pesticide residue detected. Approved for distribution.",
    certificate: "CERT-VFA-2024-001.pdf",
    tests: [
      { name: "Pesticide Residue", result: "< 0.01 ppm", standard: "< 0.1 ppm", ok: true },
      { name: "Heavy Metal (Lead)", result: "0.002 mg/kg", standard: "< 0.1 mg/kg", ok: true },
      { name: "Microbiological", result: "< 100 CFU/g", standard: "< 1000 CFU/g", ok: true },
      { name: "Moisture Content", result: "85.2%", standard: "< 90%", ok: true },
      { name: "Sugar Brix", result: "14.8°Bx", standard: "> 12°Bx", ok: true },
    ],
    status: 1,
  },
  {
    inspectionId: "INS-2024-002",
    batchId: "BTH-2024-006",
    batchCode: "BTH-2024-006",
    product: "Durian Monthong",
    productImage: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
    result: "FAIL",
    inspector: "Trần Văn Khải",
    inspectorId: "USR-002",
    organization: "Ministry of Agriculture",
    createdAt: "2024-06-25T00:00:00Z",
    category: "Safety",
    score: 45,
    notes: "Chlorpyrifos pesticide detected at 0.18 ppm, exceeding VFA limit of 0.05 ppm. Product cannot be distributed. Recall initiated.",
    certificate: null,
    tests: [
      { name: "Pesticide (Chlorpyrifos)", result: "0.18 ppm", standard: "< 0.05 ppm", ok: false },
      { name: "Heavy Metal (Lead)", result: "0.004 mg/kg", standard: "< 0.1 mg/kg", ok: true },
      { name: "Microbiological", result: "< 100 CFU/g", standard: "< 1000 CFU/g", ok: true },
      { name: "Moisture Content", result: "64.5%", standard: "< 70%", ok: true },
    ],
    status: 2,
  },
  {
    inspectionId: "INS-2024-003",
    batchId: "BTH-2024-003",
    batchCode: "BTH-2024-003",
    product: "Robusta Coffee",
    productImage: "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=80&q=80",
    result: "PENDING",
    inspector: "Nguyễn Văn Kỳ",
    inspectorId: "USR-003",
    organization: "Vietnam Food Authority (VFA)",
    createdAt: "2024-06-27T00:00:00Z",
    category: "Regulatory",
    score: 0,
    notes: "Sample collected. Lab analysis in progress. Results expected within 2 business days.",
    certificate: null,
    tests: [
      { name: "Pesticide Residue", result: "Analyzing...", standard: "< 0.1 ppm", ok: true },
      { name: "Mycotoxin (OTA)", result: "Analyzing...", standard: "< 5 μg/kg", ok: true },
      { name: "Moisture Content", result: "Analyzing...", standard: "< 12%", ok: true },
    ],
    status: 0,
  },
  {
    inspectionId: "INS-2024-004",
    batchId: "BTH-2024-002",
    batchCode: "BTH-2024-002",
    product: "Premium Jasmine Rice",
    productImage: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=80&q=80",
    result: "PASS",
    inspector: "Lý Thị Ngọc",
    inspectorId: "USR-001",
    organization: "Vietnam Food Authority (VFA)",
    createdAt: "2024-06-18T00:00:00Z",
    category: "Quality",
    score: 94,
    notes: "Đạt tiêu chuẩn xuất khẩu. Không phát hiện hóa chất.",
    certificate: "CERT-VFA-2024-002.pdf",
    tests: [
      { name: "Pesticide Residue", result: "< 0.01 ppm", standard: "< 0.1 ppm", ok: true },
      { name: "Heavy Metal (Arsenic)", result: "0.08 mg/kg", standard: "< 0.2 mg/kg", ok: true },
      { name: "Aflatoxin", result: "< 2 μg/kg", standard: "< 10 μg/kg", ok: true },
      { name: "Moisture Content", result: "13.5%", standard: "< 14%", ok: true },
    ],
    status: 1,
  },
  {
    inspectionId: "INS-2024-005",
    batchId: "BTH-2024-004",
    batchCode: "BTH-2024-004",
    product: "Longan Fruit",
    productImage: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
    result: "PASS",
    inspector: "Trần Văn Khải",
    inspectorId: "USR-002",
    organization: "Ministry of Agriculture",
    createdAt: "2024-06-20T00:00:00Z",
    category: "Quality",
    score: 91,
    notes: "Sản phẩm đạt chất lượng. Hàm lượng dinh dưỡng tốt.",
    certificate: null,
    tests: [
      { name: "Pesticide Residue", result: "< 0.01 ppm", standard: "< 0.1 ppm", ok: true },
      { name: "Heavy Metal (Lead)", result: "0.003 mg/kg", standard: "< 0.1 mg/kg", ok: true },
      { name: "Microbiological", result: "< 50 CFU/g", standard: "< 1000 CFU/g", ok: true },
      { name: "Sugar Brix", result: "21.2°Bx", standard: "> 18°Bx", ok: true },
    ],
    status: 1,
  },
  {
    inspectionId: "INS-2024-006",
    batchId: "BTH-2024-005",
    batchCode: "BTH-2024-005",
    product: "Bitter Melon",
    productImage: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=80&q=80",
    result: "PENDING",
    inspector: "Nguyễn Văn Kỳ",
    inspectorId: "USR-003",
    organization: "Vietnam Food Authority (VFA)",
    createdAt: "2024-06-28T00:00:00Z",
    category: "Safety",
    score: 0,
    notes: "Sample received. Awaiting lab results.",
    certificate: null,
    tests: [
      { name: "Pesticide Residue", result: "Analyzing...", standard: "< 0.1 ppm", ok: true },
      { name: "Heavy Metal (Lead)", result: "Analyzing...", standard: "< 0.1 mg/kg", ok: true },
    ],
    status: 0,
  },
  {
    inspectionId: "INS-2024-007",
    batchId: "BTH-2024-007",
    batchCode: "BTH-2024-007",
    product: "Black Pepper",
    productImage: "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=80&q=80",
    result: "FAIL",
    inspector: "Trần Văn Khải",
    inspectorId: "USR-002",
    organization: "Ministry of Agriculture",
    createdAt: "2024-06-22T00:00:00Z",
    category: "Regulatory",
    score: 38,
    notes: "Mycotoxin (Ochratoxin A) detected at 12 μg/kg exceeding the 5 μg/kg limit. Batch quarantined.",
    certificate: null,
    tests: [
      { name: "Mycotoxin (OTA)", result: "12 μg/kg", standard: "< 5 μg/kg", ok: false },
      { name: "Pesticide Residue", result: "< 0.01 ppm", standard: "< 0.1 ppm", ok: true },
      { name: "Moisture Content", result: "11.2%", standard: "< 12%", ok: true },
    ],
    status: 2,
  },
];

export const inspectionHandlers: Record<string, MockHandler> = {
  "GET /inspections": () =>
    ok({ items: mockData }),

  "GET /inspections/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const item = mockData.find((i) => i.inspectionId === id);
    if (!item) return { data: null, message: "Not found", status: 404 };
    return ok(item);
  },

  "POST /batches/:batchId/inspections": (config) => {
    const body = JSON.parse(config.data as string);
    return ok({
      inspectionId: "INS-2024-00" + Math.floor(Math.random() * 100),
      batchId: body.batchId || "BTH-0000",
      batchCode: body.batchId || "BTH-0000",
      product: body.product || "Unknown Product",
      productImage: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80",
      result: "PENDING",
      inspector: body.inspector || "Unknown",
      inspectorId: "USR-000",
      organization: "Vietnam Food Authority (VFA)",
      createdAt: new Date().toISOString(),
      category: body.category || "Quality",
      score: 0,
      notes: body.notes || "",
      certificate: null,
      tests: [],
      status: 0,
    });
  },

  "PATCH /inspections/:id": (config) => {
    const body = JSON.parse(config.data as string);
    const id = config.url?.split("/").pop() ?? "";
    return ok({ ...body, id });
  },
};
