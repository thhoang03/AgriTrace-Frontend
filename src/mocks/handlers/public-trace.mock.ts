import type { InternalAxiosRequestConfig } from "axios";
import {
  batches,
  timelineEvents,
  recalls,
} from "../data";
import { ok } from "../utils";

export const publicTraceHandlers: Record<
  string,
  (config: InternalAxiosRequestConfig) => { data: unknown; message: string; status: number }
> = {
  "GET /public/trace/:batchId": (config) => {
    const parts = (config.url ?? "").split("/");
    const id = parts[parts.length - 1] ?? "";
    const batch = batches.find((b) => b.id === id) ?? batches[0];
    const recall = recalls.find((r) => r.batchId === batch.id) ?? null;

    const timeline = timelineEvents.map((e) => ({
      eventTypeCode: e.stage.toUpperCase().replace(/ /g, "_"),
      organizationName: e.organization,
      eventTime: `2024-06-15T${e.time.replace(" AM", ":00").replace(" PM", ":00")}Z`,
      location: e.location,
    }));

    return ok({
      batchId: batch.id,
      batchCode: batch.id,
      productName: batch.product,
      quantity: batch.quantity,
      unitCode: "kg",
      currentOrganizationName: batch.farm,
      status: batch.status,
      statusLabel: batch.status,
      farmName: batch.farm,
      farmerName: batch.farmer,
      harvestDate: batch.harvestDate,
      location: batch.location,
      gps: batch.gps,
      productImage: batch.image,
      timeline,
      inspections: [
        { result: "PASS", inspectorName: "Lý Thị Ngọc", createdAt: "2024-06-20T10:00:00Z" },
      ],
      certificates: [
        { certificateType: "VietGAP", fileUrl: "/certs/vietgap.pdf", issuedDate: "2024-06-20" },
        { certificateType: "Food Safety", fileUrl: "/certs/food-safety.pdf", issuedDate: "2024-06-20" },
      ],
      recallStatus: recall
        ? {
            recallId: recall.id,
            reason: recall.reason,
            severity: recall.severity,
            createdDate: recall.createdDate,
            status: recall.status,
          }
        : null,
    });
  },

  "GET /public/trace/:batchId/lineage": (config) => {
    const parts = (config.url ?? "").split("/");
    const id = parts[parts.length - 2] ?? "";
    const batch = batches.find((b) => b.id === id) ?? batches[0];

    return ok({
      rootBatchId: batch.id,
      lineage: [
        {
          batchId: batch.id,
          batchCode: batch.id,
          eventTypeCode: "HARVEST",
          quantity: batch.quantity,
          unitCode: "kg",
          parentBatchId: null,
        },
        {
          batchId: batch.id + "-A",
          batchCode: batch.id + "-A",
          eventTypeCode: "SPLIT",
          quantity: Math.floor(batch.quantity * 0.6),
          unitCode: "kg",
          parentBatchId: batch.id,
        },
        {
          batchId: batch.id + "-B",
          batchCode: batch.id + "-B",
          eventTypeCode: "SPLIT",
          quantity: Math.floor(batch.quantity * 0.4),
          unitCode: "kg",
          parentBatchId: batch.id,
        },
      ],
    });
  },
};
