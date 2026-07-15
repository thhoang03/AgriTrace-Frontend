export interface SupplyChainNode {
  id: string;
  name: string;
  role: string;
  location: string;
  date: string;
  status: string;
  hash: string;
  prevHash: string;
  verified: boolean;
  children?: SupplyChainNode[];
}

export interface SupplyChainFilters {
  batchId?: string;
  page?: number;
  limit?: number;
}

export type EventType =
  | "HARVEST"
  | "RECEIVE"
  | "PROCESSING"
  | "PACKAGING"
  | "TRANSPORT"
  | "DISTRIBUTION"
  | "RETAIL"
  | "SPLIT"
  | "MERGE";

export interface SupplyChainEvent {
  eventId: number;
  batchId: number;
  eventType: EventType | string;
  timestamp: string;
  location?: string;
  description?: string;
  organizationId?: number;
  organizationName?: string;
  performedBy?: string;
  previousHash?: string;
  currentHash?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateEventRequest {
  eventType: EventType | string;
  location?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface HashChainVerifyResult {
  isValid: boolean;
  totalEvents: number;
  brokenAtEventId?: number;
  message?: string;
}
