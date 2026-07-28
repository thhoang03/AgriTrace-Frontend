import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

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

export const severityConfig = {
  Critical: { bg: "#FFEBEE", color: "#C62828", icon: AlertTriangle },
  High: { bg: "#FFEBEE", color: "#C62828", icon: AlertTriangle },
  Medium: { bg: "#FFF9C4", color: "#F57F17", icon: AlertTriangle },
  Low: { bg: "#E8F5E9", color: "#2E7D32", icon: AlertTriangle },
};

export const statusConfig = {
  Active: { bg: "#FFEBEE", color: "#C62828", icon: AlertTriangle },
  Resolved: { bg: "#E8F5E9", color: "#2E7D32", icon: CheckCircle },
  Pending: { bg: "#FFF9C4", color: "#F57F17", icon: Clock },
};
