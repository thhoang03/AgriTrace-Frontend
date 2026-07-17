import { get, post } from "../../lib/api";
import type {
  EventDetail,
  EventPagedResponse,
  EventCreatedData,
  CreateEventRequest as NewCreateEventRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface SupplyChainNode {
  id: string;
  name: string;
  role: string;
  date: string;
  children?: SupplyChainNode[];
}

export interface SupplyChainFilters {
  page?: number;
  pageSize?: number;
}

export interface SupplyChainEvent {
  eventId: string;
  batchId: string;
  eventTypeId?: string;
  eventTypeCode?: string;
  organizationId?: string;
  performedByUserId?: string;
  eventData?: string;
  location?: string;
  previousHash?: string;
  currentHash?: string;
  eventTime?: string;
}

export interface CreateEventRequest {
  eventType: string;
  location?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface HashChainVerifyResult {
  isValid: boolean;
  totalEvents: number;
}

// Adapter functions for SupplyChainNode (used by BatchLineageTab)
function adaptToNode(item: any): SupplyChainNode {
  return {
    id: item.eventId ?? item.id ?? "",
    name: item.eventTypeCode ?? item.name ?? "",
    role: item.eventTypeCode ?? item.role ?? "",
    date: item.eventTime ?? item.date ?? "",
    children: item.children?.map(adaptToNode),
  };
}

function adaptEventFromDetail(item: any): SupplyChainEvent {
  return {
    eventId: item.eventId ?? "",
    batchId: item.batchId ?? "",
    eventTypeId: item.eventTypeId ?? "",
    eventTypeCode: item.eventTypeCode ?? "",
    organizationId: item.organizationId ?? "",
    performedByUserId: item.performedByUserId ?? "",
    eventData: item.eventData ?? "",
    location: item.location ?? "",
    previousHash: item.previousHash ?? "",
    currentHash: item.currentHash ?? "",
    eventTime: item.eventTime ?? "",
  };
}

export const supplyChainApi = {
  getChain: async (batchId: string) => {
    const response = await get<any>(`/supply-chain/${batchId}`, {
      params: { batchId }
    });
    const data = response.data as any;
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { data: items.map(adaptToNode) as SupplyChainNode[] };
  },

  getNode: async (nodeId: string) => {
    const response = await get<any>(`/supply-chain/node/${nodeId}`);
    return { data: adaptToNode(response.data) };
  },

  traceByQR: async (qrCode: string) => {
    const response = await get<any>("/supply-chain/trace", { params: { qrCode } });
    const data = response.data as any;
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { data: items.map(adaptToNode) as SupplyChainNode[] };
  },

  getEvents: async (batchId: string, filters?: SupplyChainFilters) => {
    const response = await get<EventPagedResponse>(`/batches/${batchId}/events`, {
      params: {
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    const pagedData = response.data as any;
    return {
      data: (pagedData.items ?? []).map(adaptEventFromDetail) as SupplyChainEvent[],
    };
  },

  getEventById: async (eventId: number | string) => {
    const response = await get<EventDetail>(`/events/${eventId}`);
    return { data: adaptEventFromDetail(response.data) };
  },

  createEvent: async (batchId: string, data: CreateEventRequest) => {
    const newRequest: NewCreateEventRequest = {
      eventTypeId: data.eventType,
      eventData: (() => {
        const ed: Record<string, unknown> = {};
        if (data.description) ed.description = data.description;
        if (data.metadata) Object.assign(ed, data.metadata);
        return Object.keys(ed).length > 0 ? JSON.stringify(ed) : undefined;
      })(),
      location: data.location,
    };
    const response = await post<EventCreatedData>(`/batches/${batchId}/events`, newRequest);
    const createdData = response.data as any;
    return { data: { eventId: createdData.eventId ?? "" } as SupplyChainEvent };
  },

  verifyHashChain: async (batchId: string) => {
    const response = await get<{ isValid: boolean; totalEvents: number }>(
      `/batches/${batchId}/events/verify`
    );
    const verifyData = response.data as any;
    return {
      data: {
        isValid: verifyData.isValid ?? false,
        totalEvents: verifyData.totalEvents ?? 0,
      } as HashChainVerifyResult
    };
  },
};
