import { get, post } from "../../lib/api";
import type { ApiResponse } from "../../types/mapping";

// Legacy types for backward compatibility
export type ReportType = "OVERVIEW" | "BATCH" | "INSPECTION" | "RECALL" | "ANALYTICS";
export type ReportFormat = "PDF" | "EXCEL" | "CSV";

export interface GenerateReportRequest {
  type: ReportType;
  format: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  organizationId?: number;
}

export interface ReportMetadata {
  id: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  generatedBy: string;
  url: string;
  size: number;
}

// Adapter functions
function adaptReportFromItem(item: any): ReportMetadata {
  return {
    id: item.id ?? item.reportId ?? "",
    type: item.type ?? "OVERVIEW",
    format: item.format ?? "PDF",
    generatedAt: item.generatedAt ?? item.createdAt ?? "",
    generatedBy: item.generatedBy ?? "",
    url: item.url ?? "",
    size: item.size ?? 0,
  };
}

export const reportsApi = {
  generate: async (data: GenerateReportRequest) => {
    const response = await post<ReportMetadata>("/reports/generate", data);
    return { data: adaptReportFromItem(response.data) };
  },

  list: async () => {
    const response = await get<any>("/reports");
    const data = response.data as any;
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { data: items.map(adaptReportFromItem) as ReportMetadata[] };
  },
};
