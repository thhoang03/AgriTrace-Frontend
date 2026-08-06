import { post } from "../../lib/api";
import type {
  SplitBatchRequest as NewSplitBatchRequest,
  SplitBatchData,
  MergeBatchRequest as NewMergeBatchRequest,
  MergeBatchData,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface SplitBatchChild {
  quantity: number;
  unit?: string;
}

export interface SplitBatchRequest {
  children: SplitBatchChild[];
  notes?: string;
}

export interface SplitBatchResponse {
  parentBatchId: number;
  childBatchIds: number[];
}

export interface MergeBatchRequest {
  batchIds: number[];
  productId: number;
  quantity: number;
  unit?: string;
  notes?: string;
}

export interface MergeBatchResponse {
  mergedBatchId: number;
  batchCode: string;
}

// Adapter functions
function adaptSplitToNew(legacy: any): NewSplitBatchRequest {
  return {
    splits: (legacy.children || []).map((c: any) => ({
      quantity: Number(c.quantity),
      unitId: (c.unitId && c.unitId.length > 20) ? c.unitId : (legacy.unitId && legacy.unitId.length > 20) ? legacy.unitId : "00000000-0000-0000-0000-000000000000",
    })),
  };
}

function adaptSplitFromNew(data: any): SplitBatchResponse {
  return {
    parentBatchId: String(data.parentBatchId ?? data.batchId ?? ""),
    childBatchIds: (data.childBatchIds ?? data.items ?? []).map(String),
  };
}

function adaptMergeToNew(legacy: any): NewMergeBatchRequest {
  return {
    sourceBatchIds: (legacy.batchIds || legacy.sourceBatchIds || []).map(String),
    productId: legacy.productId && legacy.productId.length > 20 ? legacy.productId : "00000000-0000-0000-0000-000000000000",
    quantity: Number(legacy.quantity),
    unitId: legacy.unitId && legacy.unitId.length > 20 ? legacy.unitId : "00000000-0000-0000-0000-000000000000",
    productionDate: legacy.productionDate || new Date().toISOString().split("T")[0],
  };
}

function adaptMergeFromNew(data: any): MergeBatchResponse {
  return {
    mergedBatchId: String(data.batchId ?? data.newBatchId ?? data.mergedBatchId ?? ""),
    batchCode: data.batchCode ?? "",
  };
}

export const splitMergeApi = {
  split: async (batchId: number | string, data: SplitBatchRequest) => {
    const newRequest = adaptSplitToNew(data);
    const response = await post<SplitBatchData>(`/batches/${batchId}/split`, newRequest);
    return { data: adaptSplitFromNew(response.data) };
  },

  merge: async (data: MergeBatchRequest) => {
    const newRequest = adaptMergeToNew(data);
    const response = await post<MergeBatchData>("/batches/merge", newRequest);
    return { data: adaptMergeFromNew(response.data) };
  },
};
