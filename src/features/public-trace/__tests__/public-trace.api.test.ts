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

  it("should fetch public trace data by batch ID", async () => {
    const mockData = { batchId: "123", batchCode: "B-123" };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockData, status: 200, message: "OK" });

    const result = await publicTraceApi.getTrace("123");

    expect(api.get).toHaveBeenCalledWith("/public/trace/123");
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
