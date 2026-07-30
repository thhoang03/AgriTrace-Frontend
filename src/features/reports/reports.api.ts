import { get, post } from "../../lib/api";
import type { GenerateReportRequest, ReportMetadata, ReportType, ReportFormat } from "./reports.types";

function adaptReportFromItem(item: any): ReportMetadata {
  return {
    id: item.id ?? item.reportId ?? "",
    type: item.type ?? "OVERVIEW" as ReportType,
    format: item.format ?? "PDF" as ReportFormat,
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
    const raw = response.data as any;
    const items = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
    return { data: items.map(adaptReportFromItem) as ReportMetadata[] };
  },
};
