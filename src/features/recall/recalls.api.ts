import { getList, get, post, patch } from "../../lib/api";
import type { RecallItem, CreateRecallRequest, RecallFilters } from "./recalls.types";

export const recallsApi = {
  getAll: (filters?: RecallFilters) =>
    getList<RecallItem>("/recalls", { params: filters }),

  getById: (id: string) =>
    get<RecallItem>(`/recalls/${id}`),

  create: (data: CreateRecallRequest) =>
    post<RecallItem>("/recalls", data),

  resolve: (id: string) =>
    patch<RecallItem>(`/recalls/${id}/resolve`),

  notifyStakeholders: (id: string) =>
    post<void>(`/recalls/${id}/notify`),
};
