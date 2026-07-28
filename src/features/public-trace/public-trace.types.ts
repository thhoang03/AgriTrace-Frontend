// ── Public Trace Types ─────────────────────────────────────────────────────

/** One step in the public supply chain timeline */
export interface PublicTraceTimeline {
  eventTypeCode: string;
  organizationName: string;
  eventTime: string;      // ISO‑8601
  location: string;
}

/** Quality inspection result visible to the public */
export interface PublicTraceInspection {
  result: string;          // "PASS" | "FAIL" | "PENDING"
  inspectorName: string;
  createdAt: string;       // ISO‑8601
}

/** Quality certificate visible to the public */
export interface PublicTraceCertificate {
  certificateType: string; // "VietGAP" | "Organic" | …
  fileUrl: string;
  issuedDate: string;      // "YYYY-MM-DD"
}

/** Recall information — null when the batch is not recalled */
export interface PublicTraceRecallStatus {
  recallId: string;
  reason: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  createdDate: string;
  status: "Active" | "Resolved" | "Pending";
}

/** Full public trace response for a single batch */
export interface PublicTraceData {
  batchId: string;
  batchCode: string;
  productName: string;
  quantity: number;
  unitCode: string;
  currentOrganizationName: string;
  /** Numeric status from backend */
  status: number | string;
  /** Human-readable status label */
  statusLabel?: string;
  farmName?: string;
  farmerName?: string;
  harvestDate?: string;
  location?: string;
  gps?: string;
  productImage?: string;
  timeline: PublicTraceTimeline[];
  inspections: PublicTraceInspection[];
  certificates: PublicTraceCertificate[];
  recallStatus: PublicTraceRecallStatus | null;
}

// ── Lineage Types ──────────────────────────────────────────────────────────

/** One node in the batch family tree */
export interface BatchLineageItem {
  batchId: string;
  batchCode: string;
  eventTypeCode: string;   // "HARVEST" | "SPLIT" | "MERGE" | …
  quantity: number;
  unitCode?: string;
  parentBatchId: string | null;
}

/** Full lineage response */
export interface BatchLineageData {
  rootBatchId: string;
  lineage: BatchLineageItem[];
}
