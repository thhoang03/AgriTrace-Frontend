export type ReportFormat = "PDF" | "EXCEL" | "CSV";
export type ReportType = "OVERVIEW" | "BATCH" | "INSPECTION" | "RECALL" | "ANALYTICS";

export interface GenerateReportRequest {
  type: ReportType;
  format: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  organizationId?: string;
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
