import { getList, get, post, put } from "../../lib/api";
import type { InspectionItem, CreateInspectionRequest, InspectionFilters } from "./inspection.types";

export const inspectionApi = {
  getAll: (filters?: InspectionFilters) =>
    getList<InspectionItem>("/inspections", { params: filters }),

  getByBatchId: (batchId: string) =>
    getList<InspectionItem>(`/batches/${batchId}/inspections`),

  getById: (id: string) =>
    get<InspectionItem>(`/inspections/${id}`),

  create: (batchId: string, data: CreateInspectionRequest) =>
    post<InspectionItem>(`/batches/${batchId}/inspections`, data),

  update: (id: string, data: Partial<CreateInspectionRequest> & { status?: InspectionItem["status"]; score?: number; notes?: string }) =>
    put<InspectionItem>(`/inspections/${id}`, data),
};
