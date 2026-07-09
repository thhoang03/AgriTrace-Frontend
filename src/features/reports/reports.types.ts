export type ReportFormat = "pdf" | "csv" | "excel";
export type ReportType = "batch_summary" | "inspection_log" | "recall_report" | "supply_chain_audit" | "user_activity";

export interface GenerateReportRequest {
  type: ReportType;
  format: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  filters?: Record<string, string>;
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
