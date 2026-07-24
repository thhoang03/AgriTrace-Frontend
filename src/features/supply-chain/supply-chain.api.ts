import { get, post } from "../../lib/api";

export interface SupplyChainEvent {
  eventId: string;
  batchId: string;
  eventType: string;
  organization: string;
  location: string;
  employee: string;
  description: string;
  temperature?: string;
  humidity?: string;
  date: string;
  time: string;
  currentHash: string;
  previousHash: string;
  verified: boolean;
}

export interface CreateEventRequest {
  batchId: string;
  eventType: string;
  organization: string;
  location: string;
  gps?: string;
  employee: string;
  description: string;
  temperature?: string;
  humidity?: string;
  date: string;
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

export const supplyChainApi = {
  getEvents: async (batchId: string): Promise<SupplyChainEvent[]> => {
    if (USE_MOCK) {
      await mockDelay();
      return mockEvents.filter((e) => e.batchId === batchId);
    }
    const res = await get<SupplyChainEvent[]>(`/batches/${batchId}/events`);
    return res.data;
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
        date: new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        currentHash: "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        previousHash: mockEvents.filter((e) => e.batchId === batchId).at(-1)?.currentHash || "0x0000000000000000000000000000000000000000",
        verified: true,
      };
      mockEvents.push(newEvent);
      return newEvent;
    }
    const res = await post<SupplyChainEvent>(`/batches/${batchId}/events`, data);
    return res.data;
  },
};
