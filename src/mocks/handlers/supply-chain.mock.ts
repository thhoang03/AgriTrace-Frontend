import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const supplyChainHandlers: Record<string, MockHandler> = {
  "GET /supply-chain/:id": () =>
    ok([
      { id: "SC-001", name: "Binh Thuan Dragon Fruit Farm", role: "Producer", location: "Bình Thuận", date: "2024-06-15", status: "verified", hash: "0x4a7...", prevHash: "0x000...", verified: true },
      { id: "SC-002", name: "Binh Thuan Processing Center", role: "Processor", location: "Bình Thuận", date: "2024-06-16", status: "verified", hash: "0x5b8...", prevHash: "0x4a7...", verified: true },
      { id: "SC-003", name: "Vietnam Fresh Logistics", role: "Transporter", location: "Bình Thuận → HCMC", date: "2024-06-17", status: "verified", hash: "0x7d0...", prevHash: "0x6c9...", verified: true },
    ]),

  "GET /supply-chain/trace": () =>
    ok([
      { id: "SC-001", name: "Binh Thuan Dragon Fruit Farm", role: "Producer", location: "Bình Thuận", date: "2024-06-15", status: "verified", hash: "0x4a7...", prevHash: "0x000...", verified: true },
    ]),
};
