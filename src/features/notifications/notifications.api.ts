import { get, patch } from "../../lib/api";
import type {
  NotificationItem,
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
function adaptNotificationFromItem(item: any): Notification {
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
    const pagedData = response.data as any;
    return {
      data: {
        items: pagedData.items?.map(adaptNotificationFromItem) ?? [],
        totalCount: pagedData.totalCount ?? 0,
        page: pagedData.page ?? 1,
        pageSize: pagedData.pageSize ?? 20,
        totalPages: pagedData.totalPages ?? 1,
      }
    };
  },

  markAsRead: (id: number | string) =>
    patch<void>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    patch<void>("/notifications/read-all"),

  getUnreadCount: async () => {
    const response = await get<{ unreadCount: number }>("/notifications/unread-count");
    return { data: { unreadCount: (response.data as any).unreadCount ?? 0 } as UnreadCount };
  },
};
