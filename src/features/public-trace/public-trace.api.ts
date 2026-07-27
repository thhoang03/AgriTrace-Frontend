import { get } from "../../lib/api";
import type { PublicTraceData, BatchLineageData } from "./public-trace.types";

export const publicTraceApi = {
  /**
   * GET /public/trace/{batchId}
   * Public endpoint — no auth required.
   * Returns full traceability data for a batch (timeline, inspections, certs, recall).
   */
  getTrace: (batchId: string) =>
    get<PublicTraceData>(`/public/trace/${batchId}`),

  /**
   * GET /public/trace/{batchId}/lineage
   * Public endpoint — no auth required.
   * Returns the parent/child lineage tree for the batch.
   */
  getLineage: (batchId: string) =>
    get<BatchLineageData>(`/public/trace/${batchId}/lineage`),
};
