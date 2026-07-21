import type { AxiosRequestConfig } from "axios";
import { monthlyProduction, inspectionData, recallTrend } from "../data";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const analyticsHandlers: Record<string, MockHandler> = {
  "GET /analytics/production": () => ok(monthlyProduction),
  "GET /analytics/inspections": () => ok(inspectionData),
  "GET /analytics/recalls": () => ok(recallTrend),
};
