import { getList, get, post, patch } from "../../lib/api";
import type { InspectionItem, CreateInspectionRequest, InspectionFilters } from "./inspection.types";

export const inspectionApi = {
  getAll: (filters?: InspectionFilters) =>
    getList<InspectionItem>("/inspections", { params: filters }),

  getById: (id: string) =>
    get<InspectionItem>(`/inspections/${id}`),

  create: (data: CreateInspectionRequest) =>
    post<InspectionItem>("/inspections", data),

  updateStatus: (id: string, status: InspectionItem["status"], score: number, notes: string) =>
    patch<InspectionItem>(`/inspections/${id}`, { status, score, notes }),
};
