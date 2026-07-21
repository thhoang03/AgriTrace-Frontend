import { get, patch } from "../../lib/api";
import type {
  NotificationPagedResponse,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface Notification {
  notificationId: string;
  userId?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UnreadCount {
  unreadCount: number;
}

// Adapter functions
function adaptNotificationFromItem(item: Record<string, unknown>): Notification {
  return {
    notificationId: item.notificationId ?? "",
    userId: item.userId ?? "",
    title: item.title ?? "",
    message: item.message ?? "",
    isRead: item.isRead ?? false,
    createdAt: item.createdAt ?? "",
  };
}

export const notificationsApi = {
  getAll: async (filters?: NotificationFilters) => {
    const response = await get<NotificationPagedResponse>("/notifications", {
      params: {
        isRead: filters?.isRead,
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    const pagedData = response.data as unknown as Record<string, unknown>;
    return {
      data: {
        items: ((pagedData.items ?? []) as Record<string, unknown>[]).map(adaptNotificationFromItem) ?? [],
        totalCount: Number(pagedData.totalCount ?? 0),
        page: Number(pagedData.page ?? 1),
        pageSize: Number(pagedData.pageSize ?? 20),
        totalPages: Number(pagedData.totalPages ?? 1),
      }
    };
  },

  markAsRead: (id: number | string) =>
    patch<void>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    patch<void>("/notifications/read-all"),

  getUnreadCount: async () => {
    const response = await get<{ unreadCount: number }>("/notifications/unread-count");
    return { data: { unreadCount: response.data.unreadCount ?? 0 } as UnreadCount };
  },
};
