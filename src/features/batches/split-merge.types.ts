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
