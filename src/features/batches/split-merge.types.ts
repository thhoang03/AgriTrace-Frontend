export interface SplitBatchChild {
  quantity: number;
  unit?: string;
  unitId?: string;
}

export interface SplitBatchRequest {
  children: SplitBatchChild[];
  unitId?: string;
  notes?: string;
}

export interface SplitBatchResponse {
  parentBatchId: string;
  childBatchIds: string[];
}

export interface MergeBatchRequest {
  batchIds: (string | number)[];
  productId?: string | number;
  quantity: number;
  unit?: string;
  unitId?: string;
  notes?: string;
}

export interface MergeBatchResponse {
  mergedBatchId: string;
  batchCode: string;
}
