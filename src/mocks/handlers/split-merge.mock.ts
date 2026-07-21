import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const splitMergeHandlers: Record<string, MockHandler> = {
  "POST /batches/:id/split": (config) =>
    ok({
      originalBatchId: config.url?.split("/")[2],
      newBatches: [
        { id: "BTH-2024-008", quantity: 1200, weight: "1,200 kg" },
        { id: "BTH-2024-009", quantity: 1200, weight: "1,200 kg" },
      ],
    }),

  "POST /batches/:id/merge": (config) =>
    ok({
      mergedBatchId: "BTH-2024-010",
      sourceBatchIds: config.data?.batchIds || [],
      totalQuantity: 2400,
      totalWeight: "2,400 kg",
    }),
};
