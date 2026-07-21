export type NotificationType = "RECALL" | "INSPECTION" | "BATCH" | "SYSTEM" | "CERTIFICATE";

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type?: NotificationType | string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UnreadCount {
  count: number;
}
