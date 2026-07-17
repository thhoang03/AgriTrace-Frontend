import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const inspectionHandlers: Record<string, MockHandler> = {
  "GET /inspections": () =>
    ok([
      { id: "INS-001", batchId: "BTH-2024-001", product: "Dragon Fruit", inspector: "Lý Thị Ngọc", organization: "VFA", date: "2024-06-20", category: "Quality", status: "Passed", score: 96, notes: "Đạt chuẩn xuất khẩu" },
      { id: "INS-002", batchId: "BTH-2024-002", product: "Jasmine Rice", inspector: "Lý Thị Ngọc", organization: "VFA", date: "2024-06-18", category: "Safety", status: "Passed", score: 92, notes: "Không phát hiện hóa chất" },
      { id: "INS-003", batchId: "BTH-2024-006", product: "Durian Monthong", inspector: "Trần Văn An", organization: "Bộ NN", date: "2024-06-22", category: "Regulatory", status: "Failed", score: 45, notes: "Dư lượng thuốc BVTV vượt ngưỡng" },
      { id: "INS-004", batchId: "BTH-2024-003", product: "Robusta Coffee", inspector: "Lý Thị Ngọc", organization: "VFA", date: "2024-06-15", category: "Quality", status: "Passed", score: 94, notes: "Đạt tiêu chuẩn" },
    ]),

  "POST /inspections": (config) =>
    ok({ ...config.data, id: "INS-00" + String(Math.floor(Math.random() * 100)), score: 0, status: "Pending", organization: "VFA" }),

  "PATCH /inspections/:id": (config) =>
    ok({ ...config.data, id: config.url?.split("/").pop() }),
};
