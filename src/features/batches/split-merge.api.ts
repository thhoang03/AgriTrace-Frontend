import { post } from "../../lib/api";
import type {
  SplitBatchRequest,
  SplitBatchResponse,
  MergeBatchRequest,
  MergeBatchResponse,
} from "./split-merge.types";

export const splitMergeApi = {
  split: (batchId: number | string, data: SplitBatchRequest) =>
    post<SplitBatchResponse>(`/batches/${batchId}/split`, data),

  merge: (data: MergeBatchRequest) =>
    post<MergeBatchResponse>("/batches/merge", data),
};
