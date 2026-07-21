import { get, post, patch } from "../../lib/api";
import type {
  RecallDetail,
  RecallPagedResponse,
  CreateRecallRequest as NewCreateRecallRequest,
  ResolveRecallRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface RecallItem {
  recallId: string;
  batchId?: string;
  batchCode?: string;
  createdBy?: string;
  createdByName?: string;
  reason?: string;
  severity?: number;
  severityName?: string;
  status?: number;
  statusName?: string;
  createdAt?: string;
}

export interface CreateRecallRequest {
  batchId: string;
  reason: string;
  severity: number;
}

export interface RecallFilters {
  page?: number;
  pageSize?: number;
}

// Adapter functions
function adaptRecallFromDetail(item: Record<string, unknown>): RecallItem {
  return {
    recallId: item.recallId ?? "",
    batchId: item.batchId ?? "",
    batchCode: item.batchCode ?? "",
    createdBy: item.createdBy ?? "",
    createdByName: item.createdByName ?? "",
    reason: item.reason ?? "",
    severity: item.severity,
    severityName: item.severityName ?? "",
    status: item.status,
    statusName: item.statusName ?? "",
    createdAt: item.createdAt ?? "",
  };
}

export const recallsApi = {
  getAll: async (filters?: RecallFilters) => {
    const response = await get<RecallPagedResponse>("/recalls", {
      params: {
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    return {
      data: (response.data.items ?? []).map(adaptRecallFromDetail) ?? [],
    };
  },

  getById: async (id: string) => {
    const response = await get<RecallDetail>(`/recalls/${id}`);
    return { data: adaptRecallFromDetail(response.data) };
  },

  create: async (data: CreateRecallRequest) => {
    const newRequest: NewCreateRecallRequest = {
      batchId: data.batchId,
      reason: data.reason,
      severity: data.severity,
    };
    const response = await post<{ recallId: string }>("/recalls", newRequest);
    return { data: { recallId: response.data.recallId ?? "" } as RecallItem };
  },

  resolve: async (id: string) => {
    const newRequest: ResolveRecallRequest = { status: 2 };
    return patch<void>(`/recalls/${id}/resolve`, newRequest);
  },

  notifyStakeholders: async (id: string) =>
    post<void>(`/recalls/${id}/notify`),
};
