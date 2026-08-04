import { get } from "../../lib/api";
import type { PublicTraceData, BatchLineageData } from "./public-trace.types";

/** UUID v4 pattern – used to distinguish batch GUIDs from human-readable batch codes */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const publicTraceApi = {
  /**
   * GET /public/trace/{batchId}        – when batchId is a UUID
   * GET /public/trace/code/{batchCode} – when batchId is a human-readable code (e.g. RICE-20260112-001)
   *
   * Public endpoint — no auth required.
   * Returns full traceability data for a batch (timeline, inspections, certs, recall).
   */
  getTrace: (batchId: string) => {
    if (UUID_REGEX.test(batchId)) {
      return get<PublicTraceData>(`/public/trace/${batchId}`);
    }
    return get<PublicTraceData>(`/public/trace/code/${batchId}`);
  },

  /**
   * GET /public/trace/{batchId}/lineage
   * Public endpoint — no auth required.
   * Returns the parent/child lineage tree for the batch.
   */
  getLineage: (batchId: string) =>
    get<BatchLineageData>(`/public/trace/${batchId}/lineage`),
};
