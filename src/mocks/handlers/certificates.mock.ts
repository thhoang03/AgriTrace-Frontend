import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const certificateHandlers: Record<string, MockHandler> = {
  "GET /certificates": () =>
    ok([
      { id: "CERT-001", batchId: "BTH-2024-001", type: "VietGAP", issuedBy: "Vietnam Food Authority", issuedDate: "2024-06-16", expiryDate: "2025-06-16", status: "Valid" },
      { id: "CERT-002", batchId: "BTH-2024-002", type: "Organic", issuedBy: "Organic Certification Board", issuedDate: "2024-06-11", expiryDate: "2025-06-11", status: "Valid" },
      { id: "CERT-003", batchId: "BTH-2024-003", type: "Fair Trade", issuedBy: "Fair Trade International", issuedDate: "2024-06-02", expiryDate: "2025-06-02", status: "Valid" },
    ]),

  "GET /certificates/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    return ok({ id, batchId: "BTH-2024-001", type: "VietGAP", issuedBy: "Vietnam Food Authority", issuedDate: "2024-06-16", expiryDate: "2025-06-16", status: "Valid" });
  },

  "POST /certificates": (config) =>
    ok({ id: "CERT-00" + String(Math.floor(Math.random() * 100)), ...config.data, issuedDate: new Date().toISOString().split("T")[0], status: "Valid" }),
};
