import { getList, get, post, put, del } from "../../lib/api";
import type { Batch, TimelineEvent, BatchFilters, CreateBatchRequest, UpdateBatchRequest } from "./batches.types";

export const batchesApi = {
  getAll: (filters?: BatchFilters) =>
    getList<Batch>("/batches", { params: filters }),

  getById: (id: string) =>
    get<Batch>(`/batches/${id}`),

  create: (data: CreateBatchRequest) =>
    post<Batch>("/batches", data),

  update: (id: string, data: UpdateBatchRequest) =>
    put<Batch>(`/batches/${id}`, data),

  delete: (id: string) =>
    del(`/batches/${id}`),

  getTimeline: (batchId: string) =>
    getList<TimelineEvent>(`/batches/${batchId}/timeline`),
};
