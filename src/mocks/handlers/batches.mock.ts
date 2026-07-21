import type { AxiosRequestConfig } from "axios";
import { batches, timelineEvents } from "../data";
import type { Batch } from "../../features/batches/batches.types";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

function filterBatches(list: Batch[], config: AxiosRequestConfig): Batch[] {
  const { search, status } = config.params || {};
  let result = [...list];
  if (status && status !== "All") result = result.filter((b) => b.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (b) =>
        b.product.toLowerCase().includes(q) ||
        b.farm.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q),
    );
  }
  return result;
}

export const batchHandlers: Record<string, MockHandler> = {
  "GET /batches": (config) => ok(filterBatches(batches, config)),

  "GET /batches/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const batch = batches.find((b) => b.id === id);
    if (!batch) return { data: null, message: "Not found", status: 404 };
    return ok(batch);
  },

  "POST /batches": (config) => ok({ ...config.data, id: "BTH-2024-00" + (batches.length + 1) } as Batch),

  "PUT /batches/:id": (config) => ok({ ...config.data, id: config.url?.split("/").pop() } as Batch),

  "DELETE /batches/:id": () => ok(null),

  "GET /batches/:id/timeline": () => ok(timelineEvents),
};
