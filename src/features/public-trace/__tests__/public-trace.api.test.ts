import { describe, it, expect, vi, beforeEach } from "vitest";
import { publicTraceApi } from "../public-trace.api";
import * as api from "../../../lib/api";

// Mock the API layer
vi.mock("../../../lib/api", () => ({
  get: vi.fn(),
}));

describe("publicTraceApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch public trace data by batch UUID", async () => {
    const uuid = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
    const mockData = { batchId: uuid, batchCode: "B-123" };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockData, status: 200, message: "OK" });

    const result = await publicTraceApi.getTrace(uuid);

    expect(api.get).toHaveBeenCalledWith(`/public/trace/${uuid}`);
    expect(result).toEqual({ data: mockData, status: 200, message: "OK" });
  });

  it("should fetch public trace data by batch code", async () => {
    const batchCode = "RICE-20260112-001";
    const mockData = { batchId: "123", batchCode };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockData, status: 200, message: "OK" });

    const result = await publicTraceApi.getTrace(batchCode);

    expect(api.get).toHaveBeenCalledWith(`/public/trace/code/${batchCode}`);
    expect(result).toEqual({ data: mockData, status: 200, message: "OK" });
  });

  it("should fetch batch lineage by batch ID", async () => {
    const mockData = { rootBatchId: "123", lineage: [] };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockData, status: 200, message: "OK" });

    const result = await publicTraceApi.getLineage("123");

    expect(api.get).toHaveBeenCalledWith("/public/trace/123/lineage");
    expect(result).toEqual({ data: mockData, status: 200, message: "OK" });
  });
});
