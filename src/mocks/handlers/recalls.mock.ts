import type { AxiosRequestConfig } from "axios";
import { recalls } from "../data";
import type { RecallItem } from "../../features/recall/recalls.types";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

function filterRecalls(list: RecallItem[], config: AxiosRequestConfig): RecallItem[] {
  const { status, severity } = config.params || {};
  let result = [...list];
  if (status && status !== "All") result = result.filter((r) => r.status === status);
  if (severity && severity !== "All") result = result.filter((r) => r.severity === severity);
  return result;
}

export const recallHandlers: Record<string, MockHandler> = {
  "GET /recalls": (config) => ok(filterRecalls(recalls, config)),

  "GET /recalls/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const recall = recalls.find((r) => r.id === id);
    if (!recall) return { data: null, message: "Not found", status: 404 };
    return ok(recall);
  },

  "POST /recalls": (config) =>
    ok({
      ...config.data,
      id: "RCL-2024-00" + (recalls.length + 1),
      status: "Pending",
      createdDate: new Date().toISOString().split("T")[0],
    } as RecallItem),

  "PATCH /recalls/:id/resolve": () => ok({ ...recalls[0], status: "Resolved" }),

  "POST /recalls/:id/notify": () => ok(null),
};
