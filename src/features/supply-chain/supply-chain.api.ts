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
  // UI display fields (mock only)
  eventType?: string;
  organization?: string;
  employee?: string;
  description?: string;
  temperature?: string;
  humidity?: string;
  date?: string;
  time?: string;
  verified?: boolean;
}

export interface CreateEventRequest {
  eventType: string;
  location?: string;
  description?: string;
  organization?: string;
  employee?: string;
  temperature?: string;
  humidity?: string;
  date?: string;
  gps?: string;
  metadata?: Record<string, any>;
}

export interface HashChainVerifyResult {
  isValid: boolean;
  totalEvents: number;
}

const USE_MOCK = true;

const mockEvents: SupplyChainEvent[] = [
  { eventId: "EVT-001", batchId: "BTH-2024-001", eventType: "HARVEST", organization: "Binh Thuan Dragon Fruit Farm", location: "Phan Thiết, Bình Thuận", employee: "Trần Văn Bình", description: "Manual harvest of Grade A Dragon Fruit.", temperature: "28°C", humidity: "72%", date: "Jun 15, 2024", time: "06:30 AM", currentHash: "0x4a7b2c8d9e1f3a5b6c7d8e9f0a1b2c3d", previousHash: "0x0000000000000000000000000000000000000000", verified: true },
  { eventId: "EVT-002", batchId: "BTH-2024-001", eventType: "PROCESSING", organization: "Binh Thuan Processing Center", location: "Phan Thiết, Bình Thuận", employee: "Nguyễn Văn Công", description: "Washing, sorting, and grading. VietGAP Grade A.", temperature: "18°C", humidity: "65%", date: "Jun 16, 2024", time: "08:00 AM", currentHash: "0x5b8c3d9e0f2a4b5c6d7e8f9a0b1c2d3e", previousHash: "0x4a7b2c8d9e1f3a5b6c7d8e9f0a1b2c3d", verified: true },
  { eventId: "EVT-003", batchId: "BTH-2024-001", eventType: "PACKAGING", organization: "Binh Thuan Processing Center", location: "Phan Thiết, Bình Thuận", employee: "Lê Thị Lan", description: "Packaged in food-grade boxes with QR label.", temperature: "12°C", humidity: "80%", date: "Jun 16, 2024", time: "02:30 PM", currentHash: "0x6c9d4e0f1a2b3c4d5e6f7a8b9c0d1e2f", previousHash: "0x5b8c3d9e0f2a4b5c6d7e8f9a0b1c2d3e", verified: true },
  { eventId: "EVT-004", batchId: "BTH-2024-001", eventType: "TRANSPORT", organization: "Vietnam Fresh Logistics Co.", location: "Phan Thiết → Ho Chi Minh City", employee: "Phạm Văn Đức", description: "Cold chain transport in refrigerated truck.", temperature: "10°C", humidity: "78%", date: "Jun 17, 2024", time: "04:00 AM", currentHash: "0x7d0e5f1a2b3c4d5e6f7a8b9c0d1e2f3a", previousHash: "0x6c9d4e0f1a2b3c4d5e6f7a8b9c0d1e2f", verified: true },
  { eventId: "EVT-005", batchId: "BTH-2024-001", eventType: "DISTRIBUTION", organization: "Saigon Wholesale Market", location: "Thủ Đức, Ho Chi Minh City", employee: "Trần Thị Bảo", description: "Received at central wholesale market.", temperature: "14°C", humidity: "75%", date: "Jun 17, 2024", time: "11:00 AM", currentHash: "0x8e1f6a2b3c4d5e6f7a8b9c0d1e2f3a4b", previousHash: "0x7d0e5f1a2b3c4d5e6f7a8b9c0d1e2f3a", verified: true },
];

const mockDelay = () => new Promise((r) => setTimeout(r, 500));

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
    const response = await get<any>(`/supply-chain/${batchId}`, { params: { batchId } });
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

  getEvents: async (batchId: string, filters?: SupplyChainFilters): Promise<SupplyChainEvent[]> => {
    if (USE_MOCK) {
      await mockDelay();
      return mockEvents.filter((e) => e.batchId === batchId);
    }
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
    if (USE_MOCK) {
      await mockDelay();
      const newEvent: SupplyChainEvent = {
        eventId: `EVT-${Date.now()}`,
        batchId,
        eventType: data.eventType,
        organization: data.organization,
        location: data.location,
        employee: data.employee,
        description: data.description,
        temperature: data.temperature,
        humidity: data.humidity,
        date: new Date(data.date ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        currentHash: "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        previousHash: mockEvents.filter((e) => e.batchId === batchId).at(-1)?.currentHash || "0x0000000000000000000000000000000000000000",
        verified: true,
      };
      mockEvents.push(newEvent);
      return newEvent;
    }
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
