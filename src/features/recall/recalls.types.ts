export type RecallSeverity = "Critical" | "High" | "Medium" | "Low";
export type RecallStatus = "Active" | "Resolved" | "Pending";

export interface RecallItem {
  id: string;
  batchId: string;
  product: string;
  reason: string;
  severity: RecallSeverity;
  affectedCompanies: number;
  status: RecallStatus;
  createdDate: string;
}

export interface CreateRecallRequest {
  batchId: string;
  reason: string;
  severity: RecallSeverity;
  notes?: string;
}

export interface RecallFilters {
  status?: RecallStatus | "All";
  severity?: RecallSeverity | "All";
  page?: number;
  limit?: number;
}
