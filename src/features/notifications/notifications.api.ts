import { getPaginated, get, patch } from "../../lib/api";
import type { Notification, NotificationFilters, UnreadCount } from "./notifications.types";

export const notificationsApi = {
  getAll: (filters?: NotificationFilters) =>
    getPaginated<Notification>("/notifications", { params: filters }),

  markAsRead: (id: number | string) =>
    patch<void>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    patch<void>("/notifications/read-all"),

  getUnreadCount: () =>
    get<UnreadCount>("/notifications/unread-count"),
};
