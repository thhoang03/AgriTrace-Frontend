import { post, getList } from "../../lib/api";
import type { GenerateReportRequest, ReportMetadata } from "./reports.types";

export const reportsApi = {
  generate: (data: GenerateReportRequest) =>
    post<ReportMetadata>("/reports/generate", data),

  list: () =>
    getList<ReportMetadata>("/reports"),
};
