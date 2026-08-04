import { get, post, getList } from "../../lib/api";
import type {
  EventDetail,
  EventPagedResponse,
  EventCreatedData,
  CreateEventRequest as NewCreateEventRequest,
} from "../../types/mapping";

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
  organizationName?: string;
  performedByUserId?: string;
  performedByName?: string;
  eventData?: string;
  location?: string;
  inspectionId?: string;
  previousHash?: string;
  currentHash?: string;
  eventTime?: string;
}

export interface CreateEventRequest {
  eventType: string;
  location?: string;
  description?: string;
  inspectionId?: string;
  metadata?: Record<string, any>;
}

export interface HashChainVerifyResult {
  isValid: boolean;
  totalEvents: number;
}

export interface EventTypeLookup {
  id: string;
  code: string;
  name: string;
}

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
    organizationName: item.organizationName ?? "",
    performedByUserId: item.performedByUserId ?? "",
    performedByName: item.performedByName ?? "",
    eventData: item.eventData ?? "",
    location: item.location ?? "",
    inspectionId: item.inspectionId,
    previousHash: item.previousHash ?? "",
    currentHash: item.currentHash ?? "",
    eventTime: item.eventTime ?? "",
  };
}

export const supplyChainApi = {
  getEventTypes: async (): Promise<EventTypeLookup[]> => {
    const response = await getList<EventTypeLookup>("/event-types");
    return (response.data as any) ?? [];
  },

  getChain: async (batchId: string) => {
    try {
      const response = await get<any>(`/public/trace/${batchId}/lineage`);
      const data = response.data as any;
      const items = Array.isArray(data) ? data : data?.lineage ?? [];

      if (items.length === 0) return { data: [] };

      const nodeMap = new Map<string, SupplyChainNode>();
      items.forEach((item: any) => {
        nodeMap.set(item.batchId, {
          id: item.batchCode || (item.batchId ? item.batchId.substring(0, 8) : "Lô hàng"),
          name: item.batchCode || "Lô hàng",
          role: item.eventTypeCode || "BATCH",
          date: `Số lượng: ${item.quantity ?? 0}`,
          children: [],
        });
      });

      const rootNodes: SupplyChainNode[] = [];
      items.forEach((item: any) => {
        const node = nodeMap.get(item.batchId);
        if (node) {
          if (item.parentBatchId && nodeMap.has(item.parentBatchId)) {
            const parentNode = nodeMap.get(item.parentBatchId)!;
            parentNode.children = parentNode.children || [];
            parentNode.children.push(node);
          } else {
            rootNodes.push(node);
          }
        }
      });

      return { data: rootNodes };
    } catch {
      return { data: [] };
    }
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

  getEvents: async (batchId: string, filters?: SupplyChainFilters): Promise<SupplyChainEvent[]> => {
    const response = await get<EventPagedResponse>(`/batches/${batchId}/events`, {
      params: { page: filters?.page, pageSize: filters?.pageSize },
    });
    const pagedData = response.data as any;
    return (pagedData.items ?? []).map(adaptEventFromDetail) as SupplyChainEvent[];
  },

  getEventById: async (eventId: number | string) => {
    const response = await get<EventDetail>(`/events/${eventId}`);
    return { data: adaptEventFromDetail(response.data) };
  },

  createEvent: async (batchId: string, data: CreateEventRequest): Promise<SupplyChainEvent> => {
    const newRequest: NewCreateEventRequest = {
      eventTypeId: data.eventType,
      eventData: (() => {
        const ed: Record<string, unknown> = {};
        if (data.description) ed.description = data.description;
        if (data.metadata) Object.assign(ed, data.metadata);
        return Object.keys(ed).length > 0 ? JSON.stringify(ed) : undefined;
      })(),
      location: data.location,
      inspectionId: data.inspectionId,
    };
    const response = await post<EventCreatedData>(`/batches/${batchId}/events`, newRequest);
    const createdData = response.data as any;
    return { eventId: createdData.eventId ?? "", batchId } as SupplyChainEvent;
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
      } as HashChainVerifyResult,
    };
  },
};