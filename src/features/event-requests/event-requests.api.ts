import { get, post, put } from "../../lib/api";

export type EventRequestStatus = 0 | 1 | 2 | "Pending" | "Approved" | "Rejected";

export interface EventRequestItem {
  id: string;
  batchId: string;
  batchCode?: string;
  eventTypeId: string;
  eventTypeCode?: string;
  eventTypeName?: string;
  organizationId: string;
  organizationName?: string;
  requestedByUserId: string;
  requestedByUserName?: string;
  eventData?: string;
  location?: string;
  description?: string;
  status: EventRequestStatus;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
}

export interface CreateEventRequestPayload {
  batchId: string;
  eventTypeId: string;
  location?: string;
  description?: string;
  eventData?: string;
}

export interface GetEventRequestsParams {
  page?: number;
  pageSize?: number;
  batchId?: string;
  status?: number;
  onlyMine?: boolean;
}

export interface EventRequestsPagedResponse {
  items: EventRequestItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const eventRequestsApi = {
  getEventRequests: async (params?: GetEventRequestsParams): Promise<EventRequestsPagedResponse> => {
    const response = await get<any>("/event-requests", { params });
    const data = response.data;
    if (data && Array.isArray(data.items)) {
      return data as EventRequestsPagedResponse;
    }
    if (Array.isArray(data)) {
      return { items: data, totalCount: data.length, pageNumber: 1, pageSize: 20 };
    }
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 20 };
  },

  createEventRequest: async (payload: CreateEventRequestPayload): Promise<EventRequestItem> => {
    const response = await post<EventRequestItem>("/event-requests", payload);
    return response.data;
  },

  approveEventRequest: async (id: string): Promise<EventRequestItem> => {
    const response = await put<EventRequestItem>(`/event-requests/${id}/approve`, {});
    return response.data;
  },

  rejectEventRequest: async (id: string, reason?: string): Promise<EventRequestItem> => {
    const response = await put<EventRequestItem>(`/event-requests/${id}/reject`, { reason });
    return response.data;
  },
};
