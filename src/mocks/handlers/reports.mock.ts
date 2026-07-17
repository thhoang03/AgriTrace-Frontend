import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const reportHandlers: Record<string, MockHandler> = {
  "GET /reports": () =>
    ok([
      { id: "RPT-001", type: "batch_summary", format: "pdf", generatedAt: "2024-07-01T10:00:00Z", generatedBy: "Nguyễn Văn An", url: "/reports/rpt-001.pdf", size: 245760 },
      { id: "RPT-002", type: "inspection_log", format: "csv", generatedAt: "2024-07-02T15:30:00Z", generatedBy: "Lý Thị Ngọc", url: "/reports/rpt-002.csv", size: 102400 },
    ]),

  "POST /reports/generate": (config) =>
    ok({ id: "RPT-00" + String(Math.floor(Math.random() * 100)), ...config.data, generatedAt: new Date().toISOString(), generatedBy: "Current User", url: "/reports/rpt-new.pdf", size: 0 }),
};
