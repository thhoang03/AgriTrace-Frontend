import { get, post, put } from "../../lib/api";
import type {
  InspectionDetail,
  InspectionPagedResponse,
  CreateInspectionRequest as NewCreateInspectionRequest,
  UpdateInspectionRequest as NewUpdateInspectionRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface InspectionItem {
  inspectionId: string;
  batchId: string;
  batchCode?: string;
  inspectorId?: string;
  inspectorName?: string;
  status?: number;
  result: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateInspectionRequest {
  result: string;
  notes?: string;
}

export interface InspectionFilters {
  page?: number;
  pageSize?: number;
}

// Adapter functions
function adaptInspectionFromDetail(item: any): InspectionItem {
  return {
    inspectionId: item.inspectionId ?? "",
    batchId: item.batchId ?? "",
    batchCode: item.batchCode ?? "",
    inspectorId: item.inspectorId ?? "",
    inspectorName: item.inspectorName ?? "",
    status: item.status,
    result: item.result ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt ?? "",
  };
}

export const inspectionApi = {
  getAll: async (filters?: InspectionFilters) => {
    const response = await get<InspectionPagedResponse>("/inspections", {
      params: {
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    const pagedData = response.data as any;
    return {
      data: pagedData.items?.map(adaptInspectionFromDetail) ?? [],
    };
  },

  getByBatchId: async (batchId: string) => {
    const response = await get<InspectionPagedResponse>(`/batches/${batchId}/inspections`, {
      params: { pageSize: 100 }
    });
    const pagedData = response.data as any;
    return {
      data: pagedData.items?.map(adaptInspectionFromDetail) ?? [],
    };
  },

  getById: async (id: string) => {
    const response = await get<InspectionDetail>(`/inspections/${id}`);
    return { data: adaptInspectionFromDetail(response.data) };
  },

  create: async (batchId: string, data: CreateInspectionRequest) => {
    const newRequest: NewCreateInspectionRequest = {
      result: data.result as "PASS" | "FAIL",
      notes: data.notes,
    };
    const response = await post<{ inspectionId: string }>(`/batches/${batchId}/inspections`, newRequest);
    const createdData = response.data as any;
    return { data: { inspectionId: createdData.inspectionId ?? "" } };
  },

  update: async (id: string, data: Partial<CreateInspectionRequest> & { status?: number; score?: number; notes?: string }) => {
    const newRequest: NewUpdateInspectionRequest = {
      result: (data as any).result as "PASS" | "FAIL",
      notes: (data as any).notes,
    };
    return put<void>(`/inspections/${id}`, newRequest);
  },
};
