import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";
import type { NotificationFilters } from "./notifications.api";

const QUERY_KEY = "notifications";

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => notificationsApi.getAll(filters),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [QUERY_KEY, "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => notificationsApi.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
