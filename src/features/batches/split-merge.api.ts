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
function adaptSplitToNew(legacy: SplitBatchRequest): NewSplitBatchRequest {
  return {
    splits: legacy.children.map((c) => ({
      quantity: c.quantity,
      unitId: c.unit ?? "",
    })),
  };
}

function adaptSplitFromNew(data: Record<string, unknown>): SplitBatchResponse {
  return {
    parentBatchId: Number(data.parentBatchId ?? 0),
    childBatchIds: (data.childBatchIds ?? []).map(Number),
  };
}

function adaptMergeToNew(legacy: MergeBatchRequest): NewMergeBatchRequest {
  return {
    sourceBatchIds: legacy.batchIds.map(String),
    productId: String(legacy.productId),
    quantity: legacy.quantity,
    unitId: legacy.unit ?? "",
    productionDate: new Date().toISOString().split("T")[0],
  };
}

function adaptMergeFromNew(data: Record<string, unknown>): MergeBatchResponse {
  return {
    mergedBatchId: Number(data.newBatchId ?? 0),
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
