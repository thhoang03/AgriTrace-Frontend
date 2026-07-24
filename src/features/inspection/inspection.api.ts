import { get, post, put } from "../../lib/api";
import type {
  InspectionDetail,
  InspectionPagedResponse,
  CreateInspectionRequest as NewCreateInspectionRequest,
  UpdateInspectionRequest as NewUpdateInspectionRequest,
} from "../../types/mapping";
import type { InspectionItem, CreateInspectionRequest, InspectionFilters } from "./inspection.types";

function adaptInspectionFromDetail(item: InspectionDetail & Record<string, unknown>): InspectionItem {
  return {
    id: item.inspectionId ?? "",
    batchId: item.batchId ?? "",
    batchCode: item.batchCode ?? "",
    product: (item.product as string) ?? "",
    productImage: item.productImage as string | undefined,
    result: (item.result === "PASS" ? "Pass" : item.result === "FAIL" ? "Fail" : "Pending") as InspectionItem["result"],
    inspector: item.inspectorName ?? "",
    inspectorId: item.inspectorId ?? "",
    organization: (item.organization as string) ?? "",
    date: item.createdAt?.split("T")[0] ?? "",
    category: (item.category as InspectionItem["category"]) ?? "Quality",
    score: typeof item.score === "number" ? item.score : 0,
    notes: item.notes ?? "",
    certificate: item.certificate as string | null,
    tests: (item.tests as InspectionItem["tests"]) ?? [],
    status: typeof item.status === "number" ? item.status : undefined,
  };
}

export const inspectionApi = {
  getAll: async (filters?: InspectionFilters) => {
    const response = await get<InspectionPagedResponse>("/inspections", {
      params: {
        page: filters?.page,
        pageSize: filters?.limit,
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
      result: data.result === "Pass" ? "PASS" : data.result === "Fail" ? "FAIL" : "FAIL",
      notes: data.notes,
    };
    const response = await post<{ inspectionId: string }>(`/batches/${batchId}/inspections`, newRequest);
    const createdData = response.data as any;
    return { data: { inspectionId: createdData.inspectionId ?? "" } };
  },

  update: async (id: string, data: Partial<CreateInspectionRequest> & { status?: number; score?: number; notes?: string }) => {
    const newRequest: NewUpdateInspectionRequest = {
      result: data.result === "Pass" ? "PASS" : data.result === "Fail" ? "FAIL" : "FAIL",
      notes: data.notes,
    };
    return put<void>(`/inspections/${id}`, newRequest);
  },
};
