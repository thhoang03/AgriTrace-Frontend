import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const notificationHandlers: Record<string, MockHandler> = {
  "GET /notifications": () =>
    ok([
      { id: "NOT-001", type: "recall", title: "Recall Alert", message: "Durian Monthong batch recalled due to pesticide residue", read: false, createdAt: "2024-06-25T10:00:00Z" },
      { id: "NOT-002", type: "inspection", title: "Inspection Passed", message: "Dragon Fruit batch inspection passed", read: true, createdAt: "2024-06-24T15:30:00Z" },
      { id: "NOT-003", type: "system", title: "System Update", message: "New features available", read: true, createdAt: "2024-06-23T09:00:00Z" },
    ]),

  "PATCH /notifications/:id/read": () => ok(null),

  "PATCH /notifications/read-all": () => ok(null),
};
